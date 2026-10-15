import { createClient } from "@/lib/supabase/client";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

function isMissingTableError(error) {
  if (!error) return false;
  const message = String(error.message || "");
  return error.code === "PGRST205" || message.includes("Could not find the table");
}

export async function fetchProfileDashboardData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [profileRes, addressesRes, ordersRes, paymentsRes, prefsRes, emailNotifRes, whatsappNotifRes] = await Promise.all([
    supabase.from(SUPABASE_TABLES.profiles).select("*").eq("id", user.id).single(),
    supabase.from(SUPABASE_TABLES.userAddresses).select("*").eq("user_id", user.id),
    supabase.from(SUPABASE_TABLES.orders).select("*, order_items(*, products(title, image_url))").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from(SUPABASE_TABLES.payments).select("*, orders!inner(id, user_id, total_amount, order_items(quantity, unit_price, products(title, image_url)))").eq("orders.user_id", user.id).order("created_at", { ascending: false }),
    supabase.from(SUPABASE_TABLES.userPreferences).select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from(SUPABASE_TABLES.emailNotificationPreferences).select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from(SUPABASE_TABLES.whatsappNotificationPreferences).select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const profile = profileRes.data || {};
  const memberDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Recently";

  const addresses = (addressesRes.data || []).map((addr) => {
    let firstName = "";
    let lastName = "";
    let phone = "";
    try {
      if (addr.label && (addr.label.startsWith("{") || addr.label.startsWith("["))) {
        const parsed = JSON.parse(addr.label);
        firstName = parsed.firstName || "";
        lastName = parsed.lastName || "";
        phone = parsed.phone || "";
      } else {
        firstName = addr.label || "";
      }
    } catch {
      firstName = addr.label || "";
    }

    return {
      id: addr.id,
      firstName,
      lastName,
      line1: addr.address_line_1 || "",
      line2: addr.address_line_2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postal_code || "",
      country: addr.country || "India",
      phone,
      isDefault: addr.is_default || false,
    };
  });

  const orders = (ordersRes.data || []).map((order) => ({
    id: order.id,
    shortId: order.id.substring(0, 8).toUpperCase(),
    date: new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: order.status,
    total: `₹${order.total_amount}`,
    estimatedDelivery: order.estimated_delivery_date
      ? new Date(order.estimated_delivery_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : null,
    trackingNumber: order.tracking_number || null,
    items: (order.order_items || []).map((item) => ({
      name: item.products?.title || item.product_title || "Product",
      image: item.products?.image_url || null,
      qty: item.quantity,
      price: `₹${item.unit_price}`,
    })),
    timeline: [
      { label: "Ordered", done: true },
      { label: "Packed", done: ["packed", "shipped", "delivered"].includes(order.status) },
      { label: "Shipped", done: ["shipped", "delivered"].includes(order.status) },
      { label: "Delivered", done: order.status === "delivered" },
    ],
  }));

  const totalSpent = (paymentsRes.data || [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const transactions = (paymentsRes.data || []).map((payment) => ({
    id: payment.id.substring(0, 8).toUpperCase(),
    label: payment.payment_method || "Payment",
    amount: `₹${payment.amount}`,
    status: payment.status,
    date: new Date(payment.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    orderId: payment.orders?.id ? payment.orders.id.substring(0, 8).toUpperCase() : null,
    totalAmount: `₹${payment.orders?.total_amount ?? payment.amount ?? 0}`,
    items: (payment.orders?.order_items || []).map((oi) => ({
      name: oi.products?.title || "Product",
      image: oi.products?.image_url || null,
      qty: oi.quantity,
      price: `₹${oi.unit_price}`,
      subtotal: `₹${(Number(oi.unit_price) || 0) * (Number(oi.quantity) || 0)}`,
    })),
  }));

  const prefs = prefsRes.data?.preferences || {};
  let notifications = {
    email: emailNotifRes.data?.enabled ?? true,
    whatsapp: whatsappNotifRes.data?.enabled ?? false,
  };
  if (isMissingTableError(emailNotifRes.error) || isMissingTableError(whatsappNotifRes.error)) {
    const legacyNotifRes = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    notifications = {
      email: legacyNotifRes.data?.email ?? true,
      whatsapp: legacyNotifRes.data?.whatsapp ?? false,
    };
  }

  return {
    profile: {
      name: profile.full_name || "User",
      email: user.email,
      phone: profile.phone || "",
      customerId: user.id.substring(0, 8).toUpperCase(),
      memberSince: memberDate,
      addresses,
    },
    preferences: {
      language: prefs.language || "English",
      currency: "INR",
      gdprConsent: prefs.gdpr_consent ?? true,
      saveBrowsingHistory: prefs.save_browsing_history ?? false,
      marketingEmails: prefs.marketing_emails ?? false,
    },
    notifications,
    orders,
    payments: {
      totalSpent: `₹${totalSpent.toLocaleString("en-IN")}`,
      transactions,
    },
  };
}

export async function saveProfileData({ name, phone }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from(SUPABASE_TABLES.profiles)
    .update({ full_name: name, phone: phone || null })
    .eq("id", user.id);
  if (error) throw error;
}

export async function addAddressData(addressDraft) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.userAddresses)
    .insert({
      user_id: user.id,
      label: JSON.stringify({
        firstName: addressDraft.firstName,
        lastName: addressDraft.lastName,
        phone: addressDraft.phone || null,
      }),
      address_line_1: addressDraft.line1,
      address_line_2: addressDraft.line2 || null,
      city: addressDraft.city,
      state: addressDraft.state,
      postal_code: addressDraft.postalCode,
      country: addressDraft.country || "India",
      is_default: false,
    })
    .select()
    .single();
  if (error) throw error;
  
  return {
    id: data.id,
    first_name: addressDraft.firstName,
    last_name: addressDraft.lastName,
    address_line1: data.address_line_1,
    address_line2: data.address_line_2 || "",
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    country: data.country || "India",
    phone: addressDraft.phone || "",
    is_default: data.is_default,
  };
}

export async function updateAddressData(id, addressDraft) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.userAddresses)
    .update({
      label: JSON.stringify({
        firstName: addressDraft.firstName,
        lastName: addressDraft.lastName,
        phone: addressDraft.phone || null,
      }),
      address_line_1: addressDraft.line1,
      address_line_2: addressDraft.line2 || null,
      city: addressDraft.city,
      state: addressDraft.state,
      postal_code: addressDraft.postalCode,
      country: addressDraft.country || "India",
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id,
    first_name: addressDraft.firstName,
    last_name: addressDraft.lastName,
    address_line1: data.address_line_1,
    address_line2: data.address_line_2 || "",
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    country: data.country || "India",
    phone: addressDraft.phone || "",
  };
}

export async function deleteAddressData(id) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from(SUPABASE_TABLES.userAddresses)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function savePreferencesData(prefs) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const payload = {
    user_id: user.id,
    language: prefs.language,
    currency: "INR",
    gdpr_consent: prefs.gdprConsent,
    save_browsing_history: prefs.saveBrowsingHistory,
    marketing_emails: prefs.marketingEmails,
  };
  const { error } = await supabase
    .from(SUPABASE_TABLES.userPreferences)
    .upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}

export async function saveNotificationsData(notif) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const [emailRes, whatsappRes] = await Promise.all([
    supabase
      .from(SUPABASE_TABLES.emailNotificationPreferences)
      .upsert(
        {
          user_id: user.id,
          enabled: Boolean(notif.email),
        },
        { onConflict: "user_id" }
      ),
    supabase
      .from(SUPABASE_TABLES.whatsappNotificationPreferences)
      .upsert(
        {
          user_id: user.id,
          enabled: Boolean(notif.whatsapp),
        },
        { onConflict: "user_id" }
      ),
  ]);
  if (isMissingTableError(emailRes.error) || isMissingTableError(whatsappRes.error)) {
    const { error: legacyError } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          email: Boolean(notif.email),
          whatsapp: Boolean(notif.whatsapp),
          push: false,
        },
        { onConflict: "user_id" }
      );
    if (legacyError) throw legacyError;
    return;
  }
  if (emailRes.error) throw emailRes.error;
  if (whatsappRes.error) throw whatsappRes.error;
}

export async function saveAccountPreferences({ preferences, notifications }) {
  const response = await fetch("/api/account/preferences", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences, notifications }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to update preferences.");
  }
  return payload?.data;
}
