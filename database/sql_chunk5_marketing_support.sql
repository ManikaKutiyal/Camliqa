-- ============================================================
-- CHUNK 5: Marketing, support, loyalty, home sections
-- ============================================================

-- NEWSLETTER SUBS
CREATE TABLE IF NOT EXISTS public.newsletter_subs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PROMOTIONS
CREATE TABLE IF NOT EXISTS public.promotions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  description    text,
  discount_type  text NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL DEFAULT 0,
  starts_at      timestamptz,
  ends_at        timestamptz,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- PROMOTION TARGETS
CREATE TABLE IF NOT EXISTS public.promotion_targets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES public.products(id) ON DELETE CASCADE,
  category_id  uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  issue      text,
  subject    text,
  message    text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- HOME SECTIONS
CREATE TABLE IF NOT EXISTS public.home_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  section_type text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- HOME SECTION ITEMS
CREATE TABLE IF NOT EXISTS public.home_section_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.home_sections(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- LOYALTY WALLETS
CREATE TABLE IF NOT EXISTS public.loyalty_wallets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points     integer NOT NULL DEFAULT 0,
  tier       text NOT NULL DEFAULT 'Bronze',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- LOYALTY TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id   uuid NOT NULL REFERENCES public.loyalty_wallets(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points      integer NOT NULL DEFAULT 0,
  type        text NOT NULL DEFAULT 'earn',
  description text,
  order_id    uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  status     text NOT NULL DEFAULT 'open',
  priority   text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SUPPORT MESSAGES
CREATE TABLE IF NOT EXISTS public.support_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    text NOT NULL,
  is_staff   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AFFILIATES (new)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code              text UNIQUE NOT NULL,
  commission_rate   numeric NOT NULL DEFAULT 0.10,
  total_earnings    numeric NOT NULL DEFAULT 0,
  paid_earnings     numeric NOT NULL DEFAULT 0,
  pending_earnings  numeric NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'pending',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- JOURNAL POSTS (new)
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text UNIQUE NOT NULL,
  content          text,
  excerpt          text,
  cover_image_url  text,
  author_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published        boolean NOT NULL DEFAULT false,
  published_at     timestamptz,
  tags             text[],
  seo_title        text,
  seo_description  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
