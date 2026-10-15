-- ============================================================
-- CHUNK 4: User tables
-- ============================================================

-- USER ADDRESSES
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label          text,
  address_line_1 text,
  address_line_2 text,
  city           text,
  state          text,
  country        text DEFAULT 'India',
  postal_code    text,
  kind           text DEFAULT 'shipping',
  is_default     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- EMAIL NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.email_notification_preferences (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_updates     boolean NOT NULL DEFAULT true,
  promotions        boolean NOT NULL DEFAULT true,
  newsletter        boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- WHATSAPP NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.whatsapp_notification_preferences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_updates  boolean NOT NULL DEFAULT false,
  promotions     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- SHOPPING CARTS
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    uuid NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity   integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wishlist_id, product_id)
);

-- ABANDONED CARTS (new)
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id text,
  email      text,
  cart_data  jsonb DEFAULT '[]',
  recovered  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CHAT SESSIONS (new)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL UNIQUE,
  messages   jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
