-- ============================================================
-- CHUNK 6: RLS Policies — enable RLS on all tables + policies
-- ============================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shiprocket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_section_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"    ON public.profiles;

CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- ── CATEGORIES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all"   ON public.categories;

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_admin_all"   ON public.categories FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── BRANDS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "brands_public_read" ON public.brands;
DROP POLICY IF EXISTS "brands_admin_all"   ON public.brands;

CREATE POLICY "brands_public_read" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "brands_admin_all"   ON public.brands FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PRODUCTS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all"   ON public.products;

CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products_admin_all"   ON public.products FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PRODUCT VARIANTS ─────────────────────────────────────────
DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_admin_all"   ON public.product_variants;

CREATE POLICY "product_variants_public_read" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_variants_admin_all"   ON public.product_variants FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PRODUCT IMAGES ───────────────────────────────────────────
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_all"   ON public.product_images;

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_images_admin_all"   ON public.product_images FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PRODUCT REVIEWS ──────────────────────────────────────────
DROP POLICY IF EXISTS "product_reviews_approved_read" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_owner_insert"  ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_owner_select"  ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_admin_all"     ON public.product_reviews;

CREATE POLICY "product_reviews_approved_read" ON public.product_reviews FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "product_reviews_owner_select"  ON public.product_reviews FOR SELECT TO authenticated USING (user_id = auth.uid() OR status = 'approved' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "product_reviews_owner_insert"  ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "product_reviews_admin_all"     ON public.product_reviews FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PRODUCT INGREDIENTS ──────────────────────────────────────
DROP POLICY IF EXISTS "product_ingredients_public_read" ON public.product_ingredients;
DROP POLICY IF EXISTS "product_ingredients_admin_all"   ON public.product_ingredients;

CREATE POLICY "product_ingredients_public_read" ON public.product_ingredients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_ingredients_admin_all"   ON public.product_ingredients FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── ORDERS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_owner_select" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"    ON public.orders;

CREATE POLICY "orders_owner_select" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "orders_admin_all"    ON public.orders FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── ORDER ITEMS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_owner_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all"    ON public.order_items;

CREATE POLICY "order_items_owner_select" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "order_items_admin_all"    ON public.order_items FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PAYMENTS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_owner_select" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all"    ON public.payments;

CREATE POLICY "payments_owner_select" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "payments_admin_all"    ON public.payments FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── COUPONS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all"   ON public.coupons;

CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "coupons_admin_all"   ON public.coupons FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── COUPON REDEMPTIONS ───────────────────────────────────────
DROP POLICY IF EXISTS "coupon_redemptions_owner" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "coupon_redemptions_admin" ON public.coupon_redemptions;

CREATE POLICY "coupon_redemptions_owner" ON public.coupon_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "coupon_redemptions_admin" ON public.coupon_redemptions FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── SHIPROCKET ORDERS ────────────────────────────────────────
DROP POLICY IF EXISTS "shiprocket_orders_owner" ON public.shiprocket_orders;
DROP POLICY IF EXISTS "shiprocket_orders_admin" ON public.shiprocket_orders;

CREATE POLICY "shiprocket_orders_owner" ON public.shiprocket_orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = shiprocket_orders.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "shiprocket_orders_admin" ON public.shiprocket_orders FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── USER ADDRESSES ───────────────────────────────────────────
DROP POLICY IF EXISTS "user_addresses_owner" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_admin" ON public.user_addresses;

CREATE POLICY "user_addresses_owner" ON public.user_addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_addresses_admin" ON public.user_addresses FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── USER PREFERENCES ─────────────────────────────────────────
DROP POLICY IF EXISTS "user_preferences_owner" ON public.user_preferences;

CREATE POLICY "user_preferences_owner" ON public.user_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── EMAIL NOTIFICATION PREFERENCES ──────────────────────────
DROP POLICY IF EXISTS "email_notif_prefs_owner" ON public.email_notification_preferences;

CREATE POLICY "email_notif_prefs_owner" ON public.email_notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── WHATSAPP NOTIFICATION PREFERENCES ───────────────────────
DROP POLICY IF EXISTS "wa_notif_prefs_owner" ON public.whatsapp_notification_preferences;

CREATE POLICY "wa_notif_prefs_owner" ON public.whatsapp_notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── SHOPPING CARTS ───────────────────────────────────────────
DROP POLICY IF EXISTS "shopping_carts_owner" ON public.shopping_carts;

CREATE POLICY "shopping_carts_owner" ON public.shopping_carts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── CART ITEMS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "cart_items_owner" ON public.cart_items;

CREATE POLICY "cart_items_owner" ON public.cart_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.shopping_carts WHERE shopping_carts.id = cart_items.cart_id AND shopping_carts.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts WHERE shopping_carts.id = cart_items.cart_id AND shopping_carts.user_id = auth.uid()));

-- ── WISHLISTS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "wishlists_owner" ON public.wishlists;

CREATE POLICY "wishlists_owner" ON public.wishlists FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── WISHLIST ITEMS ───────────────────────────────────────────
DROP POLICY IF EXISTS "wishlist_items_owner" ON public.wishlist_items;

CREATE POLICY "wishlist_items_owner" ON public.wishlist_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()));

-- ── ABANDONED CARTS ──────────────────────────────────────────
DROP POLICY IF EXISTS "abandoned_carts_owner" ON public.abandoned_carts;
DROP POLICY IF EXISTS "abandoned_carts_admin" ON public.abandoned_carts;

CREATE POLICY "abandoned_carts_owner" ON public.abandoned_carts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "abandoned_carts_admin" ON public.abandoned_carts FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── CHAT SESSIONS ────────────────────────────────────────────
DROP POLICY IF EXISTS "chat_sessions_owner" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_anon_insert" ON public.chat_sessions;

CREATE POLICY "chat_sessions_owner"      ON public.chat_sessions FOR SELECT TO authenticated USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "chat_sessions_anon_insert" ON public.chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── NEWSLETTER SUBS ──────────────────────────────────────────
DROP POLICY IF EXISTS "newsletter_subs_insert" ON public.newsletter_subs;
DROP POLICY IF EXISTS "newsletter_subs_admin"  ON public.newsletter_subs;

CREATE POLICY "newsletter_subs_insert" ON public.newsletter_subs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "newsletter_subs_admin"  ON public.newsletter_subs FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PROMOTIONS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "promotions_public_read" ON public.promotions;
DROP POLICY IF EXISTS "promotions_admin_all"   ON public.promotions;

CREATE POLICY "promotions_public_read" ON public.promotions FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "promotions_admin_all"   ON public.promotions FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── PROMOTION TARGETS ────────────────────────────────────────
DROP POLICY IF EXISTS "promotion_targets_public_read" ON public.promotion_targets;
DROP POLICY IF EXISTS "promotion_targets_admin_all"   ON public.promotion_targets;

CREATE POLICY "promotion_targets_public_read" ON public.promotion_targets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "promotion_targets_admin_all"   ON public.promotion_targets FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── CONTACT MESSAGES ─────────────────────────────────────────
DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin"  ON public.contact_messages;

CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_messages_admin"  ON public.contact_messages FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── HOME SECTIONS ────────────────────────────────────────────
DROP POLICY IF EXISTS "home_sections_public_read" ON public.home_sections;
DROP POLICY IF EXISTS "home_sections_admin_all"   ON public.home_sections;

CREATE POLICY "home_sections_public_read" ON public.home_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "home_sections_admin_all"   ON public.home_sections FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── HOME SECTION ITEMS ───────────────────────────────────────
DROP POLICY IF EXISTS "home_section_items_public_read" ON public.home_section_items;
DROP POLICY IF EXISTS "home_section_items_admin_all"   ON public.home_section_items;

CREATE POLICY "home_section_items_public_read" ON public.home_section_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "home_section_items_admin_all"   ON public.home_section_items FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── LOYALTY WALLETS ──────────────────────────────────────────
DROP POLICY IF EXISTS "loyalty_wallets_owner" ON public.loyalty_wallets;
DROP POLICY IF EXISTS "loyalty_wallets_admin" ON public.loyalty_wallets;

CREATE POLICY "loyalty_wallets_owner" ON public.loyalty_wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "loyalty_wallets_admin" ON public.loyalty_wallets FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── LOYALTY TRANSACTIONS ─────────────────────────────────────
DROP POLICY IF EXISTS "loyalty_transactions_owner" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "loyalty_transactions_admin" ON public.loyalty_transactions;

CREATE POLICY "loyalty_transactions_owner" ON public.loyalty_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "loyalty_transactions_admin" ON public.loyalty_transactions FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── SUPPORT TICKETS ──────────────────────────────────────────
DROP POLICY IF EXISTS "support_tickets_owner" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_admin" ON public.support_tickets;

CREATE POLICY "support_tickets_owner" ON public.support_tickets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "support_tickets_admin" ON public.support_tickets FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── SUPPORT MESSAGES ─────────────────────────────────────────
DROP POLICY IF EXISTS "support_messages_owner" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_admin" ON public.support_messages;

CREATE POLICY "support_messages_owner" ON public.support_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "support_messages_admin" ON public.support_messages FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── AFFILIATES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "affiliates_owner_read" ON public.affiliates;
DROP POLICY IF EXISTS "affiliates_admin_all"  ON public.affiliates;

CREATE POLICY "affiliates_owner_read" ON public.affiliates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "affiliates_admin_all"  ON public.affiliates FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── JOURNAL POSTS ────────────────────────────────────────────
DROP POLICY IF EXISTS "journal_posts_public_read" ON public.journal_posts;
DROP POLICY IF EXISTS "journal_posts_admin_all"   ON public.journal_posts;

CREATE POLICY "journal_posts_public_read" ON public.journal_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "journal_posts_admin_all"   ON public.journal_posts FOR ALL   TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
