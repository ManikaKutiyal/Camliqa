-- ============================================================
-- CHUNK 7: Helper function + RPC functions for checkout
-- ============================================================

-- is_admin helper (now profiles table exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── RPC: checkout_create_order_secure ────────────────────────
-- Called from /api/checkout/create-order with admin client.
-- Creates order + order_items + payment atomically.
CREATE OR REPLACE FUNCTION public.checkout_create_order_secure(
  p_user_id        uuid,
  p_items          jsonb,
  p_shipping_address jsonb,
  p_shipping_method  text,
  p_coupon_id       uuid,
  p_coupon_code     text,
  p_amounts         jsonb,
  p_currency_code   text DEFAULT 'INR'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id   uuid;
  v_payment_id uuid;
  v_item       jsonb;
BEGIN
  -- Insert order
  INSERT INTO public.orders (
    user_id, status, total_amount,
    shipping_address_snapshot, shipping_method,
    coupon_id, coupon_code
  ) VALUES (
    p_user_id, 'pending', (p_amounts->>'total')::numeric,
    p_shipping_address, p_shipping_method,
    p_coupon_id, p_coupon_code
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, variant_id,
      product_title, variant_label, sku,
      quantity, unit_price, total_price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      NULLIF(v_item->>'variant_id', '')::uuid,
      v_item->>'product_title',
      v_item->>'variant_label',
      v_item->>'sku',
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      (v_item->>'total_price')::numeric
    );
  END LOOP;

  -- Insert pending payment record
  INSERT INTO public.payments (
    order_id, user_id, amount, status,
    method, provider, currency_code, currency
  ) VALUES (
    v_order_id, p_user_id,
    (p_amounts->>'total')::numeric,
    'pending', 'razorpay', 'razorpay',
    p_currency_code, p_currency_code
  )
  RETURNING id INTO v_payment_id;

  -- Bump coupon usage
  IF p_coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET times_used = times_used + 1,
        used_count = used_count + 1
    WHERE id = p_coupon_id;
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id, 'payment_id', v_payment_id);
END;
$$;

-- ── RPC: checkout_mark_payment_event_secure ───────────────────
-- Called from /api/payments/verify-webhook with admin client.
CREATE OR REPLACE FUNCTION public.checkout_mark_payment_event_secure(
  p_gateway_order_id   text,
  p_gateway_payment_id text,
  p_status             text,
  p_gateway_signature  text,
  p_gateway_payload    jsonb
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_payment   public.payments%ROWTYPE;
  v_order_id  uuid;
  v_became_paid boolean := false;
BEGIN
  -- Find payment by gateway_order_id (modern schema) or provider_order_id (legacy)
  SELECT * INTO v_payment
  FROM public.payments
  WHERE gateway_order_id = p_gateway_order_id
     OR provider_order_id = p_gateway_order_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found for gateway order: %', p_gateway_order_id;
  END IF;

  v_order_id := v_payment.order_id;

  -- Update payment record
  UPDATE public.payments SET
    status             = p_status,
    gateway_payment_id = COALESCE(p_gateway_payment_id, gateway_payment_id),
    gateway_signature  = COALESCE(p_gateway_signature, gateway_signature),
    gateway_response   = COALESCE(p_gateway_payload, gateway_response),
    updated_at         = now()
  WHERE id = v_payment.id;

  -- If became paid, update order status
  IF p_status = 'paid' AND v_payment.status != 'paid' THEN
    v_became_paid := true;
    UPDATE public.orders SET
      status     = 'processing',
      razorpay_order_id   = p_gateway_order_id,
      razorpay_payment_id = p_gateway_payment_id,
      razorpay_signature  = p_gateway_signature,
      updated_at = now()
    WHERE id = v_order_id;
  END IF;

  IF p_status = 'failed' THEN
    UPDATE public.orders SET status = 'cancelled', updated_at = now()
    WHERE id = v_order_id AND status = 'pending';
  END IF;

  RETURN jsonb_build_object('became_paid', v_became_paid, 'order_id', v_order_id);
END;
$$;
