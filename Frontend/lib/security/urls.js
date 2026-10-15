export function getSafeInternalPath(value, fallback = "/profile") {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://local.test");
    if (parsed.origin !== "http://local.test") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
