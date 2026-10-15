export function getClientIp(headersLike) {
  if (!headersLike?.get) {
    return "unknown";
  }

  const forwardedFor = headersLike.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headersLike.get("x-real-ip") || "unknown";
}

export function getRequestOrigin(headersLike) {
  if (!headersLike?.get) {
    return "";
  }

  return headersLike.get("origin") || headersLike.get("x-forwarded-proto") || "";
}
