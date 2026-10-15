"use client";

import { useId, useState } from "react";

function EyeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M3 3l18 18M10.6 10.6A3 3 0 0013.4 13.4M9.9 5.2A11.7 11.7 0 0112 5c6.4 0 10 7 10 7a17.6 17.6 0 01-4 4.8M6.7 6.7C4 8.5 2 12 2 12a17.3 17.3 0 003.9 4.7A10.8 10.8 0 0012 19c1.4 0 2.7-.2 4-.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function AuthPasswordField({
  label,
  name,
  placeholder,
  required = true,
  minLength,
  pattern,
  validationPattern,
  title,
  helperText,
  actionSlot,
  leadingIcon,
  inputClassName = "",
  iconClassName = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = useId();
  const resolvedValidationPattern = validationPattern || pattern;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--ink)]">
          {label}
        </label>
        {actionSlot ? <div className="flex items-center">{actionSlot}</div> : null}
      </div>

      <div className="relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] ${iconClassName}`}
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className={`min-h-14 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] px-5 pr-14 outline-none ${leadingIcon ? "pl-14" : ""} ${inputClassName}`}
          required={required}
          minLength={minLength}
          pattern={pattern}
          title={title}
          onInput={(event) => {
            if (!resolvedValidationPattern) return;
            const value = event.currentTarget.value ?? "";
            const isValid =
              value.length >= 12 &&
              /[a-z]/.test(value) &&
              /[A-Z]/.test(value) &&
              /\d/.test(value) &&
              /[^A-Za-z0-9]/.test(value);
            event.currentTarget.setCustomValidity(isValid ? "" : title || "Invalid password format.");
          }}
          onInvalid={(event) => {
            if (!resolvedValidationPattern) return;
            const value = event.currentTarget.value ?? "";
            const isValid =
              value.length >= 12 &&
              /[a-z]/.test(value) &&
              /[A-Z]/.test(value) &&
              /\d/.test(value) &&
              /[^A-Za-z0-9]/.test(value);
            event.currentTarget.setCustomValidity(isValid ? "" : title || "Invalid password format.");
          }}
        />

        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {helperText ? (
        <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{helperText}</p>
      ) : null}
    </div>
  );
}
