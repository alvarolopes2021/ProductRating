import { nanoid } from "nanoid";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type ProductFeedback = {
  id: string;
  productId: string;
  score: number;
  comment: string;
  createdBy: string;
  createdAt: string;
};

type FeedbackRow = {
  id: string;
  product_id: string;
  score: number;
  comment: string;
  created_by: string;
  created_at: string;
};

const feedbackColumns =
  "id, product_id, score, comment, created_by, created_at";

function toProductFeedback(row: FeedbackRow): ProductFeedback {
  return {
    id: row.id,
    productId: row.product_id,
    score: row.score,
    comment: row.comment,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export async function listFeedback(
  productId: string,
): Promise<ProductFeedback[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("products_feedbacks")
    .select(feedbackColumns)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toProductFeedback(row as FeedbackRow));
}

export async function createFeedback(input: {
  productId: string;
  score: number;
  comment: string;
  createdBy: string;
}): Promise<ProductFeedback> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("products_feedbacks")
    .insert({
      id: nanoid(),
      product_id: input.productId,
      score: input.score,
      comment: input.comment.trim(),
      created_by: input.createdBy,
    })
    .select(feedbackColumns)
    .single();

  if (error) {
    throw error;
  }

  return toProductFeedback(data as FeedbackRow);
}
