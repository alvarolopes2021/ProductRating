import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { createFeedback } from "@/lib/feedback";
import { getProductById } from "@/lib/products";
import { feedbackRequestSchema } from "@/lib/validations/feedback";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Sign in to leave a review." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = feedbackRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the highlighted fields and try again.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const product = await getProductById(parsed.data.productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const feedback = await createFeedback({
      productId: product.id,
      score: parsed.data.score,
      comment: parsed.data.comment,
      createdBy: session.account.id,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("[feedback] Failed to add review", error);

    return NextResponse.json(
      { error: "We could not add your review right now. Try again later." },
      { status: 500 },
    );
  }
}
