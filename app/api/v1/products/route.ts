import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
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
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sign in to add a product." },
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

    const { name, description, imageUrl, externalLink } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .insert({
        id: nanoid(),
        name,
        description: description ?? null,
        image_url: imageUrl ?? null,
        external_link: externalLink,
        score: false,
      })
      .select(
        "id, name, description, image_url, external_link, score, created_at, updated_at",
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
