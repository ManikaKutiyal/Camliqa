
import Link from "next/link";
import { CircleUserRound, Lock } from "lucide-react";

import { resetPasswordAction } from "@/app/(customer)/(auth)/actions";
import AuthPasswordField from "@/components/AuthPasswordField";
import AuthSubmitButton from "@/components/AuthSubmitButton";


export const metadata = {
  title: "Reset Password | Supro Store",
};

const RESET_ERROR_MESSAGES = {
  missing_credentials: "Please enter and confirm your new password.",
  password_mismatch: "Passwords do not match.",
  weak_password: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
  update_failed: "Failed to update password. Please try again.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const errorCode = typeof params?.error === "string" ? params.error : "";
  const error = RESET_ERROR_MESSAGES[errorCode] || errorCode || "";

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
          {/* RIGHT RESET PASSWORD */}
          <section className="w-full max-w-[33rem] rounded-[2rem] border border-[#ece3d8] bg-white/80 backdrop-blur-xl px-10 py-8 shadow-[0_25px_60px_rgba(30,35,25,0.08)]">
            <div className="mx-auto flex h-full max-w-[33rem] flex-col justify-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#6f8b5f]">
                Reset Password
              </p>

              <h2 className="mt-4 font-serif text-[clamp(2.3rem,3vw,3.6rem)] font-black leading-[0.95]">
                Create a new password
              </h2>

              <p className="mt-4 text-[#5d665f]">
                Please enter your new password below.
              </p>

              {error && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <form action={resetPasswordAction} className="mt-6 space-y-6">
                <AuthPasswordField
                  label="New Password"
                  name="password"
                  placeholder="Enter new password"
                  leadingIcon={<Lock className="h-5 w-5" />}
                />

                <AuthPasswordField
                  label="Confirm New Password"
                  name="confirm_password"
                  placeholder="Confirm new password"
                  leadingIcon={<Lock className="h-5 w-5" />}
                />

                <AuthSubmitButton
                  idleLabel="Update Password"
                  pendingLabel="Updating..."
                  className="rounded-xl bg-[#1f5531] hover:bg-[#183c25] text-white py-3 font-bold uppercase tracking-wider"
                />
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
