-- ============================================================
-- CHUNK 3: Commerce tables — orders, order_items, payments,
--          coupons, coupon_redemptions
-- ============================================================

-- COUPONS (needs to exist before orders for FK on coupon_id)
CREATE TABLE IF NOT EXISTS public.coupons (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  code                  text UNIQUE NOT NULL,
  description           text,
  deal_type             text NOT NULL DEFAULT 'discount',
  discount_percent      numeric DEFAULT 0,
  discount_amount       numeric DEFAULT 0,
  minimum_order_amount  numeric DEFAULT 0,
  usage_limit           integer,
  used_count            integer NOT NULL DEFAULT 0,
  times_used            integer NOT NULL DEFAULT 0,
  starts_at             timestamptz,
  ends_at               timestamptz,
  start_date            timestamptz,
  end_date              timestamptz,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status                     text NOT NULL DEFAULT 'pending',
  total_amount               numeric NOT NULL DEFAULT 0,
  shipping_address_snapshot  jsonb,
  shipping_method            text,
  coupon_id                  uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code                text,
  -- payment gateway
  razorpay_order_id          text,
  razorpay_payment_id        text,
  razorpay_signature         text,
  -- shipping
  shiprocket_order_id        text,
  awb_code                   text,
  tracking_id                text,
  courier_name               text,
  -- affiliate
  affiliate_code             text,
  affiliate_commission       numeric DEFAULT 0,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id    uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  variant_label text,
  sku           text,
  quantity      integer NOT NULL DEFAULT 1,
  unit_price    numeric NOT NULL DEFAULT 0,
  total_price   numeric NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount             numeric NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'pending',
  method             text,
  provider           text,
  gateway_order_id   text,
  gateway_payment_id text,
  gateway_signature  text,
  gateway_response   jsonb,
  currency_code      text DEFAULT 'INR',
  -- legacy columns
  provider_order_id  text,
  currency           text DEFAULT 'INR',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id   uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id, order_id)
);

-- SHIPROCKET ORDERS (new)
CREATE TABLE IF NOT EXISTS public.shiprocket_orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id text,
  shipment_id         text,
  awb_code            text,
  courier_name        text,
  tracking_url        text,
  status              text,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
