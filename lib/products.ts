import { getSupabaseAdmin } from "@/lib/supabase/server";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  score: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_link: string;
  score: boolean;
  created_at: string;
  updated_at: string;
};

const PRODUCT_COLUMNS =
  "id, name, description, image_url, external_link, score, created_at, updated_at";

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    externalLink: row.external_link,
    score: row.score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Returns one page plus a cursor for the next one, using limit + 1 rows. */
export async function listProducts(
  page: number,
  limit: number,
): Promise<{ items: Product[]; nextPage: number | null }> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * limit;
  const to = from + limit;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: pageRows.map(toProduct),
    nextPage: hasMore ? page + 1 : null,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!id) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toProduct(data as ProductRow) : null;
}
