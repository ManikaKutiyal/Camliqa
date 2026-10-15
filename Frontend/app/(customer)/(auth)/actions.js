"use server";

import { redirect } from "next/navigation";

import { sendResendEmail } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { verifyCaptchaToken } from "@/lib/security/captcha";
import { validateStrongPassword } from "@/lib/security/passwords";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";
import { getSafeInternalPath } from "@/lib/security/urls";
import { createClient } from "@/lib/supabase/server";

const AUTH_ERROR_CODES = {
  missing_credentials: "missing_credentials",
  invalid_credentials: "invalid_credentials",
  email_confirmation_enabled: "email_confirmation_enabled",
  signup_rate_limited: "signup_rate_limited",
  invalid_email: "invalid_email",
  weak_password: "weak_password",
  password_mismatch: "password_mismatch",
  duplicate_email: "duplicate_email",
  signup_failed: "signup_failed",
  login_failed: "login_failed",
  magic_link_email_failed: "magic_link_email_failed",
  rate_limited: "rate_limited",
  captcha_failed: "captcha_failed",
};

const AUTH_MESSAGE_CODES = {
  verify_email_sent: "verify_email_sent",
};

async function getRequestMetadata() {
  const headersList = await import("next/headers").then((module) => module.headers());
  return {
    headersList,
    ip: getClientIp(headersList),
    origin: headersList.get("origin") || "http://localhost:3000",
  };
}

async function assertAuthRateLimit(scope, identifier = "") {
  const { ip } = await getRequestMetadata();
  assertRateLimit({
    key: `auth:${scope}:${ip}:${String(identifier || "").toLowerCase()}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
}

async function verifyCaptcha(formData) {
  const { ip } = await getRequestMetadata();
  const token = formData.get("captchaToken")?.toString().trim() || "";
  const result = await verifyCaptchaToken({ token, ip });
  if (result.configured && !result.success) {
    return false;
  }
  return true;
}

function getLoginErrorCode(error) {
  if (error?.code === "email_not_confirmed") {
    return AUTH_ERROR_CODES.email_confirmation_enabled;
  }

  if (error?.message === "Invalid login credentials") {
    return AUTH_ERROR_CODES.invalid_credentials;
  }

  if (error?.code === "email_provider_disabled") {
    const details = [error.code, error.message].filter(Boolean).join(":");
    return `login_failed:${details}`;
  }

  const details = [error?.code, error?.message].filter(Boolean).join(":");
  return details ? `login_failed:${details}` : AUTH_ERROR_CODES.login_failed;
}

function getSignupErrorCode(error) {
  if (
    error?.code === "user_already_exists" ||
    error?.message === "User already registered" ||
    error?.message === "A user with this email address has already been registered"
  ) {
    return AUTH_ERROR_CODES.duplicate_email;
  }

  if (error?.code === "over_email_send_rate_limit") {
    return AUTH_ERROR_CODES.signup_rate_limited;
  }

  if (error?.code === "email_address_invalid") {
    return AUTH_ERROR_CODES.invalid_email;
  }

  if (error?.code === "unexpected_failure" && String(error?.message || "").includes("magic link email")) {
    return AUTH_ERROR_CODES.magic_link_email_failed;
  }

  const details = [error?.code, error?.message].filter(Boolean).join(":");
  return details ? `signup_failed:${details}` : AUTH_ERROR_CODES.signup_failed;
}

function getAdminClient() {
  return createAdminClient();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMagicLinkViaResend({ email, fullName, emailRedirectTo, origin, nextPath }) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: emailRedirectTo,
    },
  });

  if (error || !data?.properties) {
    const details = [error?.code, error?.message].filter(Boolean).join(":");
    throw new Error(details || "Unable to generate magic link.");
  }

  // Construct a direct link to our callback route using the token_hash.
  // This avoids Supabase's implicit flow which appends #access_token to the URL
  // and allows our server-side route to properly handle the session.
  const tokenHash = data.properties.hashed_token;
  const verifyType = data.properties.verification_type || "magiclink";
  const verifyUrl = `${origin}/auth/callback?token_hash=${tokenHash}&type=${verifyType}&next=${encodeURIComponent(nextPath)}`;

  await sendResendEmail({
    to: email,
    subject: "Verify your email and sign in",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#222;line-height:1.55">
        <p style="margin:0 0 12px">Hi ${escapeHtml(fullName || "there")},</p>
        <p style="margin:0 0 12px">Welcome! Please verify your email and complete sign-in by clicking the button below.</p>
        <p style="margin:20px 0">
          <a href="${verifyUrl}" style="display:inline-block;background:#1f5531;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600">
            Verify Email
          </a>
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#666">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;font-size:12px;color:#555">${verifyUrl}</p>
      </div>`,
  });
}

async function sendRecoveryLinkViaResend({ email, emailRedirectTo, origin }) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: emailRedirectTo,
    },
  });

  if (error || !data?.properties) {
    const details = [error?.code, error?.message].filter(Boolean).join(":");
    throw new Error(details || "Unable to generate recovery link.");
  }

  const tokenHash = data.properties.hashed_token;
  const verifyType = data.properties.verification_type || "recovery";
  const verifyUrl = `${origin}/auth/callback?token_hash=${tokenHash}&type=${verifyType}&next=/reset-password`;

  await sendResendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#222;line-height:1.55">
        <p style="margin:0 0 12px">Hi there,</p>
        <p style="margin:0 0 12px">You requested to reset your password. Click the button below to continue.</p>
        <p style="margin:20px 0">
          <a href="${verifyUrl}" style="display:inline-block;background:#1f5531;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#666">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;font-size:12px;color:#555">${verifyUrl}</p>
      </div>`,
  });
}

export async function loginAction(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const next = getSafeInternalPath(formData.get("next")?.toString(), "/profile");
  const rememberMe = formData.get("remember_me") === "on";

  if (!email || !password) {
    redirect(`/login?error=${AUTH_ERROR_CODES.missing_credentials}&next=${encodeURIComponent(next)}`);
  }

  try {
    await assertAuthRateLimit("login", email);
  } catch {
    redirect(`/login?error=${AUTH_ERROR_CODES.rate_limited}&next=${encodeURIComponent(next)}`);
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("auth_remember_me", rememberMe ? "true" : "false", { maxAge: 10, path: "/" });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login error", {
      code: error.code,
      message: error.message,
      status: error.status,
      name: error.name,
    });
    redirect(`/login?error=${getLoginErrorCode(error)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signupAction(formData) {
  const fullName = formData.get("full_name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirm_password")?.toString() || "";
  const next = getSafeInternalPath(formData.get("next")?.toString(), "/profile");

  if (!fullName || !email || !password || !confirmPassword) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.missing_credentials}&next=${encodeURIComponent(next)}`);
  }

  if (password !== confirmPassword) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.password_mismatch}&next=${encodeURIComponent(next)}`);
  }

  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.valid) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.weak_password}&next=${encodeURIComponent(next)}`);
  }

  try {
    await assertAuthRateLimit("signup", email);
  } catch {
    redirect(`/signup?error=${AUTH_ERROR_CODES.rate_limited}&next=${encodeURIComponent(next)}`);
  }

  if (!(await verifyCaptcha(formData))) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.captcha_failed}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { origin } = await getRequestMetadata();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name: fullName,
    },
    email_confirm: true,
  });

  if (error) {
    console.error("Supabase signup error", {
      code: error.code,
      message: error.message,
      status: error.status,
      name: error.name,
    });
    redirect(`/signup?error=${getSignupErrorCode(error)}&next=${encodeURIComponent(next)}`);
  }

  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.duplicate_email}&next=${encodeURIComponent(next)}`);
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  try {
    await sendMagicLinkViaResend({ email, fullName, emailRedirectTo, origin, nextPath: next });
  } catch (error) {
    console.error("Signup Resend magic-link flow failed", error);
    redirect(`/signup?error=${AUTH_ERROR_CODES.magic_link_email_failed}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/signup?message=${AUTH_MESSAGE_CODES.verify_email_sent}&next=${encodeURIComponent(next)}`);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const next = getSafeInternalPath(formData.get("next")?.toString(), "/login");

  if (!email) {
    redirect(`/forgot-password?error=${AUTH_ERROR_CODES.missing_credentials}&next=${encodeURIComponent(next)}`);
  }

  try {
    await assertAuthRateLimit("forgot-password", email);
  } catch {
    redirect(`/forgot-password?error=${AUTH_ERROR_CODES.rate_limited}&next=${encodeURIComponent(next)}`);
  }

  if (!(await verifyCaptcha(formData))) {
    redirect(`/forgot-password?error=${AUTH_ERROR_CODES.captcha_failed}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { origin } = await getRequestMetadata();
  const emailRedirectTo = `${origin}/auth/callback?next=/reset-password`;
  
  try {
    await sendRecoveryLinkViaResend({ email, emailRedirectTo, origin });
  } catch (error) {
    console.error("Supabase forgot password error", error);
    redirect(`/forgot-password?error=${AUTH_ERROR_CODES.magic_link_email_failed}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/forgot-password?message=reset_link_sent&next=${encodeURIComponent(next)}`);
}

export async function resetPasswordAction(formData) {
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirm_password")?.toString() || "";
  
  if (!password || !confirmPassword) {
    redirect(`/reset-password?error=${AUTH_ERROR_CODES.missing_credentials}`);
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${AUTH_ERROR_CODES.password_mismatch}`);
  }

  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.valid) {
    redirect(`/reset-password?error=${AUTH_ERROR_CODES.weak_password}`);
  }

  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error("Supabase reset password error", error);
    redirect(`/reset-password?error=update_failed`);
  }

  redirect(`/login?message=password_updated`);
}

export async function magicLinkAction(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const next = getSafeInternalPath(formData.get("next")?.toString(), "/profile");

  if (!email) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.missing_credentials}&next=${encodeURIComponent(next)}`);
  }

  try {
    await assertAuthRateLimit("magic-link", email);
  } catch {
    redirect(`/signup?error=${AUTH_ERROR_CODES.rate_limited}&next=${encodeURIComponent(next)}`);
  }

  if (!(await verifyCaptcha(formData))) {
    redirect(`/signup?error=${AUTH_ERROR_CODES.captcha_failed}&next=${encodeURIComponent(next)}`);
  }

  const { origin } = await getRequestMetadata();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    await sendMagicLinkViaResend({ email, fullName: "", emailRedirectTo, origin, nextPath: next });
  } catch (error) {
    console.error("Magic link via Resend failed", error);
    redirect(`/signup?error=${AUTH_ERROR_CODES.magic_link_email_failed}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/signup?message=magic_link_sent&next=${encodeURIComponent(next)}`);
}

export async function resendVerificationAction(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const next = getSafeInternalPath(formData.get("next")?.toString(), "/profile");

  if (!email) {
    redirect(`/login?error=${AUTH_ERROR_CODES.missing_credentials}&next=${encodeURIComponent(next)}`);
  }

  try {
    await assertAuthRateLimit("resend_verification", email);
  } catch {
    redirect(`/login?error=${AUTH_ERROR_CODES.rate_limited}&next=${encodeURIComponent(next)}`);
  }

  const admin = getAdminClient();
  let targetUser = null;
  let page = 1;

  try {
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      if (!data?.users || data.users.length === 0) break;
      const found = data.users.find(u => String(u.email || "").toLowerCase() === email);
      if (found) {
        targetUser = found;
        break;
      }
      if (data.users.length < 1000) break;
      page++;
    }
  } catch (err) {
    console.error("Failed to list users in verification resend:", err);
    redirect(`/login?error=${AUTH_ERROR_CODES.login_failed}&next=${encodeURIComponent(next)}`);
  }

  if (!targetUser) {
    redirect(`/login?message=verify_email_sent&next=${encodeURIComponent(next)}`);
  }

  if (targetUser.email_confirmed_at) {
    redirect(`/login?error=email_already_confirmed&next=${encodeURIComponent(next)}`);
  }

  const { origin } = await getRequestMetadata();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: emailRedirectTo,
      },
    });

    if (linkError || !linkData?.properties) {
      throw new Error(linkError?.message || "Link generation failed");
    }

    const tokenHash = linkData.properties.hashed_token;
    const verifyType = linkData.properties.verification_type || "signup";
    const verifyUrl = `${origin}/auth/callback?token_hash=${tokenHash}&type=${verifyType}&next=${encodeURIComponent(next)}`;

    const fullName = targetUser.user_metadata?.full_name || "Valued Customer";

    await sendResendEmail({
      to: email,
      subject: "Confirm your email address",
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#222;line-height:1.55">
          <p style="margin:0 0 12px">Hi ${escapeHtml(fullName)},</p>
          <p style="margin:0 0 12px">Please confirm your email address to complete your registration and activate your account by clicking the button below.</p>
          <p style="margin:20px 0">
            <a href="${verifyUrl}" style="display:inline-block;background:#1a1a3e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;letter-spacing:0.05em">
              Confirm Email Address
            </a>
          </p>
          <p style="margin:0 0 12px;font-size:13px;color:#666">If the button does not work, copy and paste this URL into your browser:</p>
          <p style="word-break:break-all;font-size:12px;color:#555">${verifyUrl}</p>
        </div>`,
    });
  } catch (error) {
    console.error("Resend verification link failed", error);
    redirect(`/login?error=${AUTH_ERROR_CODES.magic_link_email_failed}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?message=verify_email_sent&next=${encodeURIComponent(next)}`);
}
