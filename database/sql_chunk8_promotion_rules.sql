-- ============================================================
-- CHUNK 8: Promotion rule fields
-- Run this once on Supabase before using automatic promotions.
-- ============================================================

ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS promotion_kind text NOT NULL DEFAULT 'product_discount',
  ADD COLUMN IF NOT EXISTS applies_to text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS required_quantity integer,
  ADD COLUMN IF NOT EXISTS bundle_price numeric,
  ADD COLUMN IF NOT EXISTS get_quantity integer,
  ADD COLUMN IF NOT EXISTS minimum_order_amount numeric,
  ADD COLUMN IF NOT EXISTS gift_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.promotion_targets
  ADD COLUMN IF NOT EXISTS category text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'promotions_promotion_kind_check'
  ) THEN
    ALTER TABLE public.promotions
      ADD CONSTRAINT promotions_promotion_kind_check
      CHECK (promotion_kind IN ('product_discount', 'category_discount', 'buy_x_for_y', 'buy_x_get_y', 'free_gift'))
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'promotions_applies_to_check'
  ) THEN
    ALTER TABLE public.promotions
      ADD CONSTRAINT promotions_applies_to_check
      CHECK (applies_to IN ('all', 'products', 'categories'))
      NOT VALID;
  END IF;
END $$;
