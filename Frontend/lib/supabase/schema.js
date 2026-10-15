// ─────────────────────────────────────────────────────────────
// Storage buckets
// ─────────────────────────────────────────────────────────────
export const SUPABASE_BUCKETS = {
  productImages:  "product-images",
  categoryImages: "category-images",
  journalImages:  "journal-images",
  avatars:        "avatars",
}

// ─────────────────────────────────────────────────────────────
// Table names (matches live DB)
// ─────────────────────────────────────────────────────────────
export const SUPABASE_TABLES = {
  // Catalog
  products:          "products",
  productVariants:   "product_variants",
  productImages:     "product_images",
  productReviews:    "product_reviews",
  productIngredients:"product_ingredients",
  brands:            "brands",
  categories:        "categories",

  // Commerce
  orders:            "orders",
  orderItems:        "order_items",
  payments:          "payments",
  coupons:           "coupons",
  couponRedemptions: "coupon_redemptions",
  shiprocketOrders:  "shiprocket_orders",

  // User
  profiles:                         "profiles",
  userAddresses:                    "user_addresses",
  userPreferences:                  "user_preferences",
  emailNotificationPreferences:     "email_notification_preferences",
  whatsappNotificationPreferences:  "whatsapp_notification_preferences",

  // Cart & Wishlist
  shoppingCarts:  "shopping_carts",
  cartItems:      "cart_items",
  wishlists:      "wishlists",
  wishlistItems:  "wishlist_items",
  abandonedCarts: "abandoned_carts",

  // Loyalty
  loyaltyWallets:      "loyalty_wallets",
  loyaltyTransactions: "loyalty_transactions",

  // Support
  supportTickets:  "support_tickets",
  supportMessages: "support_messages",

  // Marketing
  newsletterSubs:   "newsletter_subs",
  promotions:       "promotions",
  promotionTargets: "promotion_targets",
  contactMessages:  "contact_messages",
  homeSections:     "home_sections",
  homeSectionItems: "home_section_items",

  // Affiliate
  affiliates: "affiliates",

  // Chat
  chatSessions: "chat_sessions",

  // Journal / Blog
  journalPosts: "journal_posts",

  // Admin pages alignment note:
  //   The admin "Discounts" page uses SUPABASE_TABLES.coupons ("coupons").
  //   The legacy "discounts" table in the DB is unrelated — do not use it.
}

// ─────────────────────────────────────────────────────────────
// Enum-like constants
// ─────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  pending:    "pending",
  processing: "processing",
  shipped:    "shipped",
  delivered:  "delivered",
  cancelled:  "cancelled",
}

export const PAYMENT_STATUS = {
  pending:  "pending",
  paid:     "paid",
  failed:   "failed",
  refunded: "refunded",
}

export const PAYMENT_PROVIDER = {
  razorpay: "razorpay",
}

export const PRODUCT_STATUS = {
  active:   "active",
  draft:    "draft",
  archived: "archived",
}

export const REVIEW_STATUS = {
  pending:  "pending",
  approved: "approved",
  rejected: "rejected",
}

export const SUPPORT_TICKET_STATUS = {
  open:       "open",
  inProgress: "in_progress",
  resolved:   "resolved",
  closed:     "closed",
}

export const SUPPORT_TICKET_PRIORITY = {
  low:    "low",
  normal: "normal",
  high:   "high",
  urgent: "urgent",
}

export const ADDRESS_KIND = {
  shipping: "shipping",
  billing:  "billing",
}

export const LOYALTY_TIER = {
  bronze:   "Bronze",
  silver:   "Silver",
  gold:     "Gold",
  platinum: "Platinum",
}

export const NEWSLETTER_STATUS = {
  active:   true,
  inactive: false,
}

export const USER_ROLE = {
  customer: "customer",
  admin:    "admin",
}

export const AFFILIATE_STATUS = {
  pending:  "pending",
  active:   "active",
  inactive: "inactive",
}

// ─────────────────────────────────────────────────────────────
// Feature → table/bucket mapping (for capability checks)
// ─────────────────────────────────────────────────────────────
export const SUPABASE_FEATURE_MAPPING = {
  // Admin
  adminEditProduct: {
    tables:  [SUPABASE_TABLES.products, SUPABASE_TABLES.productVariants, SUPABASE_TABLES.productImages],
    buckets: [SUPABASE_BUCKETS.productImages],
  },
  adminViewCustomerProfiles: {
    tables: [SUPABASE_TABLES.profiles, SUPABASE_TABLES.userAddresses],
  },
  adminViewOrders: {
    tables: [SUPABASE_TABLES.orders, SUPABASE_TABLES.orderItems, SUPABASE_TABLES.payments],
  },
  adminManageCoupons: {
    tables: [SUPABASE_TABLES.coupons, SUPABASE_TABLES.couponRedemptions],
  },
  adminManageLoyalty: {
    tables: [SUPABASE_TABLES.loyaltyWallets, SUPABASE_TABLES.loyaltyTransactions],
  },
  adminManageSupport: {
    tables: [SUPABASE_TABLES.supportTickets, SUPABASE_TABLES.supportMessages],
  },
  adminManageNewsletter: {
    tables: [SUPABASE_TABLES.newsletterSubs],
  },
  adminManageAffiliates: {
    tables: [SUPABASE_TABLES.affiliates],
  },
  adminManageJournal: {
    tables:  [SUPABASE_TABLES.journalPosts],
    buckets: [SUPABASE_BUCKETS.journalImages],
  },

  // Storefront
  storefrontViewProduct: {
    tables:  [SUPABASE_TABLES.products, SUPABASE_TABLES.productVariants, SUPABASE_TABLES.productImages, SUPABASE_TABLES.productReviews],
    buckets: [SUPABASE_BUCKETS.productImages],
  },
  storefrontCheckout: {
    tables: [SUPABASE_TABLES.orders, SUPABASE_TABLES.orderItems, SUPABASE_TABLES.payments, SUPABASE_TABLES.productVariants],
  },
  storefrontCart: {
    tables: [SUPABASE_TABLES.shoppingCarts, SUPABASE_TABLES.cartItems],
  },
  storefrontWishlist: {
    tables: [SUPABASE_TABLES.wishlists, SUPABASE_TABLES.wishlistItems],
  },
  storefrontNewsletterFooter: {
    tables: [SUPABASE_TABLES.newsletterSubs],
  },
  storefrontJournal: {
    tables:  [SUPABASE_TABLES.journalPosts],
    buckets: [SUPABASE_BUCKETS.journalImages],
  },

  // Account
  accountProfile: {
    tables: [
      SUPABASE_TABLES.profiles,
      SUPABASE_TABLES.userPreferences,
      SUPABASE_TABLES.emailNotificationPreferences,
      SUPABASE_TABLES.whatsappNotificationPreferences,
    ],
  },
  accountAddresses: {
    tables: [SUPABASE_TABLES.userAddresses],
  },
  accountOrders: {
    tables: [SUPABASE_TABLES.orders, SUPABASE_TABLES.orderItems, SUPABASE_TABLES.payments],
  },
  accountLoyalty: {
    tables: [SUPABASE_TABLES.loyaltyWallets, SUPABASE_TABLES.loyaltyTransactions],
  },
  accountSupport: {
    tables: [SUPABASE_TABLES.supportTickets, SUPABASE_TABLES.supportMessages],
  },
}