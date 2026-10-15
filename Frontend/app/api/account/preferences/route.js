import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/server/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

const ALLOWED_LANGUAGES = ["English", "Hindi"];
const ALLOWED_CURRENCIES = ["INR"];

function toBool(value, fallback) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function isMissingTableError(error) {
  if (!error) return false;
  const message = String(error.message || "");
  return error.code === "PGRST205" || message.includes("Could not find the table");
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [prefsRes, emailNotifRes, whatsappNotifRes] = await Promise.all([
      supabase
        .from(SUPABASE_TABLES.userPreferences)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from(SUPABASE_TABLES.emailNotificationPreferences)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from(SUPABASE_TABLES.whatsappNotificationPreferences)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

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

    return NextResponse.json({
      data: {
        preferences: {
          language: prefsRes.data?.language || "English",
          currency: "INR",
          gdprConsent: prefsRes.data?.gdpr_consent ?? true,
          saveBrowsingHistory: prefsRes.data?.save_browsing_history ?? false,
          marketingEmails: prefsRes.data?.marketing_emails ?? false,
        },
        notifications,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load preferences.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const incomingPrefs = body?.preferences || {};
    const incomingNotif = body?.notifications || {};

    const language = String(incomingPrefs.language || "English");
    const currency = "INR";
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language preference." }, { status: 400 });
    }
    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json({ error: "Invalid currency preference." }, { status: 400 });
    }

    const prefsPayload = {
      user_id: user.id,
      preferences: {
        language,
        currency,
        gdpr_consent: toBool(incomingPrefs.gdprConsent, true),
        save_browsing_history: toBool(incomingPrefs.saveBrowsingHistory, false),
        marketing_emails: toBool(incomingPrefs.marketingEmails, false),
      }
    };

    const emailNotifPayload = {
      user_id: user.id,
      enabled: toBool(incomingNotif.email, true),
    };
    const whatsappNotifPayload = {
      user_id: user.id,
      enabled: toBool(incomingNotif.whatsapp, false),
    };

    const [prefsWrite, emailNotifWrite, whatsappNotifWrite] = await Promise.all([
      supabase
        .from(SUPABASE_TABLES.userPreferences)
        .upsert(prefsPayload, { onConflict: "user_id" }),
      supabase
        .from(SUPABASE_TABLES.emailNotificationPreferences)
        .upsert(emailNotifPayload, { onConflict: "user_id" }),
      supabase
        .from(SUPABASE_TABLES.whatsappNotificationPreferences)
        .upsert(whatsappNotifPayload, { onConflict: "user_id" }),
    ]);

    if (prefsWrite.error) {
      return NextResponse.json({ error: prefsWrite.error.message }, { status: 400 });
    }
    if (isMissingTableError(emailNotifWrite.error) || isMissingTableError(whatsappNotifWrite.error)) {
      const legacyNotifWrite = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: user.id,
            email: emailNotifPayload.enabled,
            whatsapp: whatsappNotifPayload.enabled,
            push: false,
          },
          { onConflict: "user_id" }
        );
      if (legacyNotifWrite.error) {
        return NextResponse.json({ error: legacyNotifWrite.error.message }, { status: 400 });
      }
    } else if (emailNotifWrite.error) {
      return NextResponse.json({ error: emailNotifWrite.error.message }, { status: 400 });
    } else if (whatsappNotifWrite.error) {
      return NextResponse.json({ error: whatsappNotifWrite.error.message }, { status: 400 });
    }

    // Marketing preference is wired with newsletter subscription state.
    if (user.email) {
      const admin = createAdminClient();
      await admin
        .from(SUPABASE_TABLES.newsletterSubs)
        .upsert(
          { email: user.email.toLowerCase(), active: prefsPayload.marketing_emails },
          { onConflict: "email" },
        );
    }

    return NextResponse.json({
      data: {
        preferences: {
          language: prefsPayload.preferences.language,
          currency: prefsPayload.preferences.currency,
          gdprConsent: prefsPayload.preferences.gdpr_consent,
          saveBrowsingHistory: prefsPayload.preferences.save_browsing_history,
          marketingEmails: prefsPayload.preferences.marketing_emails,
        },
        notifications: {
          email: emailNotifPayload.enabled,
          whatsapp: whatsappNotifPayload.enabled,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update preferences.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
