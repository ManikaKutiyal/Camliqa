
import Link from "next/link";
import { CircleUserRound, Lock, Mail, UserRound } from "lucide-react";

import { magicLinkAction, signupAction } from "@/app/(customer)/(auth)/actions";
import MagicLinkSessionWatcher from "@/components/MagicLinkSessionWatcher";
import AuthPasswordField from "@/components/AuthPasswordField";
import AuthSubmitButton from "@/components/AuthSubmitButton";


export const metadata = {
  title: "Signup | Supro Store",
};

const SIGNUP_ERROR_MESSAGES = {
  missing_credentials: "Please fill all required fields.",
  weak_password: "Use at least 12 characters with uppercase, lowercase, number, and special character.",
  password_mismatch: "Password and confirm password do not match.",
  signup_rate_limited: "Signup is temporarily blocked. Please try again later.",
  invalid_email: "Please enter a valid email address.",
  duplicate_email: "This email is already registered. Please login instead.",
  magic_link_email_failed: "We could not send the verification email right now. Please try again in a moment.",
  email_confirmation_enabled: "This account is still marked unverified. Please try signing up again.",
  signup_failed: "Unable to create your account right now. Please try again.",
  rate_limited: "Too many signup attempts. Please try again in a few minutes.",
  captcha_failed: "Captcha verification failed. Please try again.",
};



export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const errorCode = typeof params?.error === "string" ? params.error : "";
  const error = SIGNUP_ERROR_MESSAGES[errorCode] || errorCode || "";
  const next =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/profile";
  
  const isMagicMode = params?.mode === "magic";
  const messageCode = typeof params?.message === "string" ? params.message : "";
  const SIGNUP_SUCCESS_MESSAGES = {
    magic_link_sent: "Magic link sent. Open it in the new tab to verify, then return here. We will auto-sign you in.",
    verify_email_sent: "Please verify your email from your inbox before signing in."
  };
  const message = SIGNUP_SUCCESS_MESSAGES[messageCode] || messageCode || "";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf7f0] text-[#17251f]">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-0 pt-2">
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

        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <section className="w-full max-w-[33rem] min-h-0 overflow-hidden rounded-[1.5rem] border border-[#ece3d8] bg-white/80 px-5 py-6 shadow-[0_18px_40px_rgba(30,35,25,0.08)] sm:px-8 xl:rounded-[2rem] xl:px-10">
            <div className="mx-auto flex h-full max-w-[33rem] flex-col justify-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#6f8b5f]">
                Sign Up
              </p>

              <h2 className="mt-3 font-serif text-[clamp(2.1rem,2.8vw,3.2rem)] font-black leading-[0.94]">
                Create your account
              </h2>

              <p className="mt-3 text-[#5d665f]">
                Manage your profile, track orders, and enjoy a personalized shopping experience.
              </p>

              {error ? (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {message}
                </p>
              ) : null}

              {isMagicMode || messageCode === "verify_email_sent" ? <MagicLinkSessionWatcher next={next} /> : null}

              <div className="mt-5 mb-6 flex rounded-xl bg-[#f3ebde] p-1">
                <Link
                  href={`/signup?next=${next}`}
                  className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
                    !isMagicMode ? "bg-white text-[#1f5531] shadow" : "text-[#8a8055] hover:text-[#17251f]"
                  }`}
                >
                  Password
                </Link>
                <Link
                  href={`/signup?mode=magic&next=${next}`}
                  className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
                    isMagicMode ? "bg-white text-[#1f5531] shadow" : "text-[#8a8055] hover:text-[#17251f]"
                  }`}
                >
                  Magic Link
                </Link>
              </div>

              {!isMagicMode ? (
                <form action={signupAction} className="space-y-3">
                <input type="hidden" name="next" value={next} />

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa09a]" />
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter your full name"
                      className="min-h-14 w-full rounded-xl border border-[#e5dfd4] bg-white/90 px-12 focus:border-[#6f8b5f] focus:ring-2 focus:ring-[#6f8b5f]/10 outline-none"
                      required
                    />
                  </div>
                </div>

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

                <AuthPasswordField
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  validationPattern="contains_upper_lower_number"
                  title="Password must be at least 12 characters and include uppercase, lowercase, number, and special character."
                  helperText="Use at least 12 characters with uppercase, lowercase, number, and special character."
                  leadingIcon={<Lock className="h-5 w-5" />}
                />

                <AuthPasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  placeholder="Confirm your password"
                  leadingIcon={<Lock className="h-5 w-5" />}
                />

                <label className="flex items-start gap-3 text-sm leading-6 text-[#5d665f]">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-5 w-5 rounded border border-[#cad4c2] accent-[#215331]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms-conditions" className="font-medium text-[#6f8b5f]">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="font-medium text-[#6f8b5f]">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <AuthSubmitButton
                  idleLabel="Sign Up"
                  pendingLabel="Creating..."
                  className="rounded-xl bg-[#1f5531] hover:bg-[#183c25] text-white py-3 font-bold uppercase tracking-wider"
                />
              </form>
              ) : (
              <form action={magicLinkAction} className="space-y-3">
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



              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href={`/login?next=${next}`} className="font-bold text-[#215331]">
                  Login
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
