import "server-only";

import { getCaptchaEnv } from "@/lib/server/env";

export async function verifyCaptchaToken({ token, ip }) {
  const { provider, secretKey } = getCaptchaEnv();

  // Placeholder integration: if no provider is configured, we skip enforcement.
  // Production can enable Turnstile or hCaptcha by wiring these env vars.
  if (!provider || !secretKey) {
    return { configured: false, success: true };
  }

  if (!token) {
    return { configured: true, success: false, message: "Captcha verification is required." };
  }

  if (provider === "turnstile") {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip || "",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    return {
      configured: true,
      success: Boolean(payload?.success),
      message: payload?.["error-codes"]?.join(", ") || "Captcha verification failed.",
    };
  }

  if (provider === "hcaptcha") {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip || "",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    return {
      configured: true,
      success: Boolean(payload?.success),
      message: payload?.["error-codes"]?.join(", ") || "Captcha verification failed.",
    };
  }

  return {
    configured: true,
    success: false,
    message: `Unsupported captcha provider: ${provider}`,
  };
}
