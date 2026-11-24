import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type SessionAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type SessionPayload = {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
};

const COOKIE_NAME = "pr_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Session is not configured. Set SESSION_SECRET in the environment.",
    );
  }

  return secret;
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    typeof payload.email === "string" &&
    payload.email.length > 0 &&
    typeof payload.firstName === "string" &&
    typeof payload.lastName === "string" &&
    typeof payload.iat === "number" &&
    Number.isFinite(payload.iat) &&
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

function decodePayload(token: string): SessionPayload | null {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split(".");

  if (!encodedPayload || !signature || extra !== undefined) {
    return null;
  }

  const provided = Buffer.from(signature, "base64url");
  const expected = Buffer.from(sign(encodedPayload, secret), "base64url");

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  if (!isSessionPayload(parsed)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (parsed.iat > now || parsed.exp <= now) {
    return null;
  }

  return parsed;
}

export async function getSession(): Promise<{
  account: SessionAccount;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = decodePayload(token);

  if (!payload) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("accounts")
      .select("id, first_name, last_name, email, active")
      .eq("id", payload.sub)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      account: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
      },
    };
  } catch (error) {
    console.error("[session] Failed to load the active account", error);

    return null;
  }
}

export async function createSession(account: SessionAccount): Promise<void> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    iat: now,
    exp: now + MAX_AGE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const token = `${encodedPayload}.${sign(encodedPayload, secret)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
