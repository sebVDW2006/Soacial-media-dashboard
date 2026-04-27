const SESSION_COOKIE = "content_os_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.CONTENT_OS_SESSION_SECRET;

  if (!secret) {
    throw new Error("CONTENT_OS_SESSION_SECRET is not set.");
  }

  return secret;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
}

async function sign(value: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(timestamp = Date.now()) {
  const payload = `${timestamp}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [timestamp, signature] = token.split(".");

  if (!timestamp || !signature) {
    return false;
  }

  const expected = await sign(timestamp);

  if (signature !== expected) {
    return false;
  }

  const issuedAt = Number(timestamp);

  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  const maxAgeMs = SESSION_MAX_AGE_SECONDS * 1000;
  return Date.now() - issuedAt <= maxAgeMs;
}

export function getSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

