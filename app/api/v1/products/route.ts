import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { listProducts, type Product } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  createProductSchema,
  listProductsQuerySchema,
} from "@/lib/validations/product";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = listProductsQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid pagination parameters.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const result = await listProducts(parsed.data.page, parsed.data.limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[products] Failed to list products", error);
    return NextResponse.json(
      { error: "We could not load products right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }
    console.log(body);

    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Some fields are invalid. Please review and try again.",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, link, image } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .insert({
        id: nanoid(),
        name,
        description: null,
        image_url: image ?? null,
        external_link: link,
        score: false,
      })
      .select(
        "id, name, description, image_url, external_link, score, ai_summary, ai_summary_updated_at, created_at, updated_at",
      )
      .single();

    if (error) {
      throw error;
    }

    const product: Product = {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      externalLink: data.external_link,
      score: data.score,
      aiSummary: data.ai_summary,
      aiSummaryUpdatedAt: data.ai_summary_updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[products] Failed to create product", error);
    return NextResponse.json(
      { error: "We could not save the product right now. Try again later." },
      { status: 500 },
    );
  }
}
