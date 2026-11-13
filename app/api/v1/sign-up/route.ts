import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { signUpRequestSchema } from "@/lib/validations/sign-up";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = signUpRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields are invalid. Please review and try again.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const supabase = getSupabaseAdmin();

    const { data: existingAccount, error: lookupError } = await supabase
      .from("accounts")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingAccount) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const { hash, salt } = await hashPassword(password);
    const timestamp = new Date().toISOString();
    const account = {
      id: nanoid(),
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      password: hash,
      salt,
      active: true,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const { error: insertError } = await supabase
      .from("accounts")
      .insert(account);

    if (insertError) {
      // Postgres unique violation (e.g. concurrent sign-up for the same email).
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }

      throw insertError;
    }

    return NextResponse.json(
      {
        account: {
          id: account.id,
          firstName: account.first_name,
          lastName: account.last_name,
          email: account.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[sign-up] Failed to create account", error);

    return NextResponse.json(
      { error: "We could not create your account right now. Try again later." },
      { status: 500 },
    );
  }
}
