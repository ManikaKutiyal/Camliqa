export const PASSWORD_MIN_LENGTH = 12;

export function validateStrongPassword(password) {
  const value = String(password || "");
  const errors = [];

  if (value.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
  }
  if (!/[a-z]/.test(value)) {
    errors.push("Password must include a lowercase letter.");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("Password must include an uppercase letter.");
  }
  if (!/\d/.test(value)) {
    errors.push("Password must include a number.");
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push("Password must include a special character.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
