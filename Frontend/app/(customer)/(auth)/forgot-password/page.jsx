
import Link from "next/link";
import { CircleUserRound, Mail } from "lucide-react";

import { forgotPasswordAction } from "@/app/(customer)/(auth)/actions";
import AuthSubmitButton from "@/components/AuthSubmitButton";


export const metadata = {
  title: "Forgot Password | Supro Store",
};

const FORGOT_ERROR_MESSAGES = {
  missing_credentials: "Please enter your email.",
  invalid_email: "Invalid email address.",
  login_failed: "Unable to send reset link right now. Please try again.",
  rate_limited: "Too many reset attempts. Please try again in a few minutes.",
  captcha_failed: "Captcha verification failed. Please try again.",
};

const FORGOT_SUCCESS_MESSAGES = {
  reset_link_sent: "If an account exists, a reset link has been sent to your email.",
};

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  const errorCode = typeof params?.error === "string" ? params.error : "";
  const messageCode = typeof params?.message === "string" ? params.message : "";

  const error = FORGOT_ERROR_MESSAGES[errorCode] || errorCode || "";
  const message = FORGOT_SUCCESS_MESSAGES[messageCode] || messageCode || "";

  const next = typeof params?.next === "string" ? params.next : "/login";

  return (
    <div className="h-screen overflow-hidden bg-[#fbf7f0] text-[#17251f]">
      <div className="mx-auto flex h-full max-w-[1680px] flex-col px-0 pt-2">
        <header className="flex h-[92px] items-center justify-between border-b border-[#e8dece] px-8 lg:px-12">
          <Link
            href="/"
            className="leading-none text-[#17251f]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="text-[3.1rem] font-semibold tracking-[-0.06em]">
              Supro
            </span>
            <span className="ml-0.5 text-[3.1rem] font-semibold tracking-[-0.08em] text-[#587049]">
              .
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span>Customer account access</span>
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full border bg-white shadow">
              <CircleUserRound className="h-5 w-5 text-[#6d885c]" />
            </span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
          {/* RIGHT FORGOT PASSWORD */}
          <section className="w-full max-w-[33rem] rounded-[2rem] border border-[#ece3d8] bg-white/80 backdrop-blur-xl px-10 py-8 shadow-[0_25px_60px_rgba(30,35,25,0.08)]">
            <div className="mx-auto flex h-full max-w-[33rem] flex-col justify-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#6f8b5f]">
                Forgot Password
              </p>

              <h2 className="mt-4 font-serif text-[clamp(2.3rem,3vw,3.6rem)] font-black leading-[0.95]">
                Reset your password
              </h2>

              <p className="mt-4 text-[#5d665f]">
                We'll send you an OTP via email to verify your identity.
              </p>

              {error && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {message && (
                <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {message}
                </p>
              )}

              <form action={forgotPasswordAction} className="mt-6 space-y-6">
                <input type="hidden" name="next" value={next} />

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa09a]" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="min-h-14 w-full rounded-xl border border-[#e5dfd4] bg-white/90 px-12 focus:border-[#6f8b5f] focus:ring-2 focus:ring-[#6f8b5f]/10 outline-none"
                      required
                    />
                  </div>
                </div>

                <AuthSubmitButton
                  idleLabel="Send Reset Link"
                  pendingLabel="Sending..."
                  className="rounded-xl bg-[#1f5531] hover:bg-[#183c25] text-white py-3 font-bold uppercase tracking-wider"
                />
              </form>

              <p className="mt-6 text-center text-sm">
                Remember your password?{" "}
                <Link href={`/login?next=${next}`} className="font-bold text-[#215331]">
                  Back to login
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
