import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { signInRequestSchema } from "@/lib/validations/sign-in";

export const runtime = "nodejs";

const INVALID_CREDENTIALS_MESSAGE = "Email or password is invalid.";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", fieldErrors: {} },
      { status: 400 },
    );
  }

  const parsed = signInRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields are invalid. Please review and try again.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const supabase = getSupabaseAdmin();

    const { data: account, error: lookupError } = await supabase
      .from("accounts")
      .select("id, first_name, last_name, email, password, active")
      .eq("email", normalizedEmail)
      .eq("active", true)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    const credentialsAreValid =
      !!account &&
      account.active === true &&
      (await verifyPassword(
        password,
        typeof account.password === "string" ? account.password : "",
      ));

    if (!credentialsAreValid || !account) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MESSAGE },
        { status: 401 },
      );
    }

    const sessionAccount = {
      id: account.id,
      firstName: account.first_name,
      lastName: account.last_name,
      email: account.email,
    };

    await createSession(sessionAccount);

    return NextResponse.json({ account: sessionAccount }, { status: 200 });
  } catch (error) {
    console.error("[sign-in] Failed to sign in", error);

    return NextResponse.json(
      { error: "We could not sign you in right now. Try again later." },
      { status: 500 },
    );
  }
}
