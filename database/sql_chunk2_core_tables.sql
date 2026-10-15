-- ============================================================
-- CHUNK 2: Core tables — profiles, categories, brands,
--          products, product_variants, product_images, product_reviews
-- ============================================================

-- PROFILES (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  email           text,
  phone           text,
  avatar_url      text,
  role            text NOT NULL DEFAULT 'customer',
  -- skincare-specific
  affiliate_id    text,
  referred_by     text,
  skin_type       text,
  skin_concerns   text[],
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  image_url     text,
  price_under   numeric,
  active        boolean NOT NULL DEFAULT true,
  parent_id     uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order    integer NOT NULL DEFAULT 0,
  product_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  image_url      text,
  logo_url       text,
  discount_label text,
  active         boolean NOT NULL DEFAULT true,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text UNIQUE NOT NULL,
  description         text,
  short_description   text,
  price               numeric NOT NULL DEFAULT 0,
  compare_at_price    numeric,
  discount_price      numeric,
  discount_percent    numeric,
  image_url           text,
  category            text,
  category_id         uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sub_category        text,
  brand_id            uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  stock               integer NOT NULL DEFAULT 0,
  active              boolean NOT NULL DEFAULT true,
  status              text NOT NULL DEFAULT 'active',
  rating              numeric DEFAULT 0,
  -- skincare-specific
  skin_type           text[],
  concern             text[],
  suitable_for        text,
  tags                text[],
  key_benefits        text[],
  how_to_use          text,
  featured            boolean NOT NULL DEFAULT false,
  seo_title           text,
  seo_description     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku            text,
  stock_count    integer NOT NULL DEFAULT 0,
  size           text,
  color          text,
  price_override numeric,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url        text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       text,
  review      text,
  status      text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- PRODUCT INGREDIENTS (new)
CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
