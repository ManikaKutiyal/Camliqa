
import Link from "next/link";
import { CircleUserRound, Lock, Mail } from "lucide-react";

import { loginAction, magicLinkAction, resendVerificationAction } from "@/app/(customer)/(auth)/actions";
import MagicLinkSessionWatcher from "@/components/MagicLinkSessionWatcher";
import AuthPasswordField from "@/components/AuthPasswordField";
import AuthSubmitButton from "@/components/AuthSubmitButton";


export const metadata = {
  title: "Login | Supro Store",
};

const LOGIN_ERROR_MESSAGES = {
  missing_credentials: "Please enter your email and password.",
  invalid_credentials: "Invalid email or password.",
  email_confirmation_enabled: "Your email address is not yet verified. Please check your inbox or spam folder for the verification link.",
  email_already_confirmed: "This email address is already verified. You can log in using your password.",
  login_failed: "Unable to login right now. Please try again.",
  magic_link_email_failed: "We could not send the verification email right now. Please try again in a moment.",
  rate_limited: "Too many login attempts. Please try again in a few minutes.",
  captcha_failed: "Captcha verification failed. Please try again.",
};

const LOGIN_SUCCESS_MESSAGES = {
  signup_login_ready: "Signup successful. Please login.",
  magic_link_sent: "Magic link sent. Open it in the new tab to verify, then return here. We will auto-sign you in.",
  verify_email_sent: "Please verify your email from your inbox before signing in."
};



export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const errorCode = typeof params?.error === "string" ? params.error : "";
  const messageCode = typeof params?.message === "string" ? params.message : "";

  const error =
    LOGIN_ERROR_MESSAGES[errorCode] || errorCode || "";

  const message =
    LOGIN_SUCCESS_MESSAGES[messageCode] || messageCode || "";

  const next =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/profile";
      
  const isMagicMode = params?.mode === "magic";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf7f0] text-[#17251f]">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-0 pt-2">
        {/* HEADER (UNCHANGED) */}
        <header className="flex min-h-[76px] items-center justify-between border-b border-[#e8dece] px-4 sm:px-6 lg:px-12">
          <Link
            href="/"
            className="leading-none text-[#17251f]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="text-[2.2rem] font-semibold tracking-[-0.06em] sm:text-[2.7rem] lg:text-[3.1rem]">
              Supro
            </span>
            <span className="ml-0.5 text-[2.2rem] font-semibold tracking-[-0.08em] text-[#587049] sm:text-[2.7rem] lg:text-[3.1rem]">
              .
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="hidden sm:inline">Customer account access</span>
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full border bg-white shadow">
              <CircleUserRound className="h-5 w-5 text-[#6d885c]" />
            </span>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">

          {/* RIGHT LOGIN */}
          <section className="w-full max-w-[33rem] rounded-[1.5rem] border border-[#ece3d8] bg-white/80 px-5 py-6 shadow-[0_18px_40px_rgba(30,35,25,0.08)] backdrop-blur-xl sm:px-8 xl:rounded-[2rem] xl:px-10 xl:py-8">
            <div className="mx-auto flex h-full max-w-[33rem] flex-col justify-center">

              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#6f8b5f]">
                Login
              </p>

              <h2 className="mt-4 font-serif text-[clamp(2.3rem,3vw,3.6rem)] font-black leading-[0.95]">
                Continue your shopping journey
              </h2>

              <p className="mt-4 text-[#5d665f]">
                Manage your profile and explore your personalized space.
              </p>

              {error && (
                <div className="space-y-4">
                  <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                  
                  {errorCode === "email_confirmation_enabled" && (
                    <form action={resendVerificationAction} className="rounded-xl border border-[#e8dece] bg-[#fffaf7] p-4.5 space-y-3 shadow-sm">
                      <input type="hidden" name="next" value={next} />
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f8b5f]">
                        Resend Verification Email
                      </p>
                      <p className="text-xs text-[#5d665f] leading-relaxed">
                        Did not receive the email? Enter your email address to receive another verification link.
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa09a]" />
                          <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            className="h-10 w-full rounded-lg border border-[#e5dfd4] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#6f8b5f] focus:ring-1 focus:ring-[#6f8b5f]/10"
                            required
                          />
                        </div>
                        <AuthSubmitButton
                          idleLabel="Send"
                          pendingLabel="Sending..."
                          className="h-10 min-h-0 shrink-0 rounded-lg bg-[#1f5531] hover:bg-[#183c25] text-white px-5 text-xs font-bold uppercase tracking-wider transition-all"
                        />
                      </div>
                    </form>
                  )}
                </div>
              )}

              {message && (
                <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {message}
                </p>
              )}

              {isMagicMode || messageCode === "verify_email_sent" ? <MagicLinkSessionWatcher next={next} /> : null}

              <div className="mt-5 mb-6 flex rounded-xl bg-[#f3ebde] p-1">
                <Link
                  href={`/login?next=${next}`}
                  className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
                    !isMagicMode ? "bg-white text-[#1f5531] shadow" : "text-[#8a8055] hover:text-[#17251f]"
                  }`}
                >
                  Password
                </Link>
                <Link
                  href={`/login?mode=magic&next=${next}`}
                  className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
                    isMagicMode ? "bg-white text-[#1f5531] shadow" : "text-[#8a8055] hover:text-[#17251f]"
                  }`}
                >
                  Magic Link
                </Link>
              </div>

              {!isMagicMode ? (
                <form action={loginAction} className="space-y-4">
                  <input type="hidden" name="next" value={next} />

                  {/* EMAIL */}
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

                  {/* PASSWORD */}
                  <AuthPasswordField
                    label="Password"
                    name="password"
                    placeholder="Enter your password"
                    leadingIcon={<Lock className="h-5 w-5" />}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="remember_me" defaultChecked />
                      Remember me
                    </label>
                    <Link href="/forgot-password" className="text-[#6f8b5f] hover:underline">
                      Forgot?
                    </Link>
                  </div>

                  <AuthSubmitButton
                    idleLabel="Login"
                    pendingLabel="Logging..."
                    className="rounded-xl bg-[#1f5531] hover:bg-[#183c25] text-white py-3 font-bold uppercase tracking-wider"
                  />
                </form>
              ) : (
                <form action={magicLinkAction} className="space-y-4">
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
                    idleLabel="Send Magic Link"
                    pendingLabel="Sending..."
                    className="rounded-xl bg-[#1f5531] hover:bg-[#183c25] text-white py-3 font-bold uppercase tracking-wider mt-4"
                  />
                </form>
              )}



              <p className="mt-6 text-center text-sm">
                Don’t have an account?{" "}
                <Link href={`/signup?next=${next}`} className="font-bold text-[#215331]">
                  Create account
                </Link>
              </p>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
