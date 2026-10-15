"use client";

import { useFormStatus } from "react-dom";

export default function AuthSubmitButton({ idleLabel, pendingLabel, className = "" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`customer-primary-button min-h-14 w-full disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
