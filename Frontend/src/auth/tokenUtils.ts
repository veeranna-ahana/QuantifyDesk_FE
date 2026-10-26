export type JwtPayload = Record<string, unknown> & {
  exp?: number;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    return payload && typeof payload === "object"
      ? (payload as JwtPayload)
      : null;
  } catch {
    return null;
  }
}

export function getExpiry(token: string): number | null {
  const expiry = decodeJwt(token)?.exp;
  return typeof expiry === "number" && Number.isFinite(expiry)
    ? expiry
    : null;
}

export function isExpired(token: string, skewSeconds = 30): boolean {
  const expiry = getExpiry(token);
  return expiry === null || expiry <= Date.now() / 1000 + skewSeconds;
}
