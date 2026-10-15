import "server-only";

function cleanEnvValue(value) {
  return String(value ?? "").trim().replace(/^["']|["']$/g, "");
}

function getRequiredEnv(name) {
  const value = cleanEnvValue(process.env[name]);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function isMockSecret(value) {
  const normalized = cleanEnvValue(value).toLowerCase();
  return !normalized || normalized.includes("mock");
}

export function getSupabaseAdminEnv() {
  return {
    url:            getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getRazorpayEnv() {
  return {
    keyId:         cleanEnvValue(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
    keySecret:     cleanEnvValue(process.env.RAZORPAY_KEY_SECRET),
    webhookSecret: cleanEnvValue(process.env.RAZORPAY_WEBHOOK_SECRET),
  };
}

export function hasLiveRazorpayEnv() {
  const { keyId, keySecret } = getRazorpayEnv();
  return Boolean(keyId && keySecret && !isMockSecret(keyId) && !isMockSecret(keySecret));
}

export function hasLiveRazorpayWebhookSecret() {
  const { webhookSecret } = getRazorpayEnv();
  return Boolean(webhookSecret && !isMockSecret(webhookSecret));
}

export function getCaptchaEnv() {
  return {
    provider:  cleanEnvValue(process.env.CAPTCHA_PROVIDER).toLowerCase(),
    secretKey: cleanEnvValue(process.env.CAPTCHA_SECRET_KEY),
  };
}

export function getGeminiEnv() {
  return {
    apiKey: cleanEnvValue(process.env.GEMINI_API_KEY),
  };
}

export function hasGeminiEnv() {
  const { apiKey } = getGeminiEnv();
  return Boolean(apiKey && !isMockSecret(apiKey));
}

export function getShiprocketEnv() {
  return {
    email:    cleanEnvValue(process.env.SHIPROCKET_EMAIL),
    password: cleanEnvValue(process.env.SHIPROCKET_PASSWORD),
    baseUrl:  cleanEnvValue(process.env.SHIPROCKET_BASE_URL) || "https://apiv2.shiprocket.in/v1/external",
    pickupLocationId: cleanEnvValue(process.env.SHIPROCKET_PICKUP_LOCATION) || "Primary",
    webhookSecret: cleanEnvValue(process.env.SHIPROCKET_WEBHOOK_SECRET),
  };
}

export function hasShiprocketEnv() {
  const { email, password } = getShiprocketEnv();
  return Boolean(email && password);
}

export function getResendEnv() {
  return {
    apiKey:    cleanEnvValue(process.env.RESEND_API_KEY),
    fromEmail: cleanEnvValue(process.env.RESEND_FROM_EMAIL) || "noreply@camliqa.com",
  };
}

export function hasResendEnv() {
  const { apiKey } = getResendEnv();
  return Boolean(apiKey && !isMockSecret(apiKey));
}
