import "server-only";

import type { ProductFeedback } from "@/lib/feedback";
import { type Product, updateProductAiSummary } from "@/lib/products";
import { productSummaryAgent } from "@/mastra/agents/product-summary-agent";

const MAX_REVIEWS = 50;

function buildPrompt(productName: string, feedback: ProductFeedback[]): string {
  const reviews = feedback
    .slice(0, MAX_REVIEWS)
    .map(
      (item, index) => `${index + 1}. [${item.score}/5] ${item.comment.trim()}`,
    )
    .join("\n");

  return [
    `Product: ${productName}`,
    "",
    `Reviews (newest first, ${feedback.length} total):`,
    reviews,
    "",
    "Write a general summary of what reviewers say about this product.",
    "Mention the overall rating trend when it is clear from the scores.",
    "Do not invent facts that are not present in the reviews.",
    "Reply in 2 to 4 sentences, in plain English, without Markdown.",
  ].join("\n");
}

/**
 * Returns the stored summary, generating and persisting it when missing.
 *
 * Set `force` after a new review arrives so the summary reflects all comments.
 * Generation failures never break the page or the review submission: the last
 * stored summary is kept and the error is logged for diagnosis.
 */
export async function ensureProductSummary(
  product: Product,
  feedback: ProductFeedback[],
  options: { force?: boolean } = {},
): Promise<string | null> {
  const existing = product.aiSummary;

  if (feedback.length === 0) {
    return existing;
  }

  if (!options.force && existing) {
    return existing;
  }

  if (!process.env.OPENAI_API_KEY) {
    return existing;
  }

  try {
    const result = await productSummaryAgent.generate(
      buildPrompt(product.name, feedback),
      {
        maxSteps: 1,
        modelSettings: {
          temperature: 0.2,
          maxOutputTokens: 240,
          maxRetries: 1,
        },
      },
    );

    const summary = result.text?.trim();

    if (!summary) {
      return existing;
    }

    await updateProductAiSummary(product.id, summary);

    return summary;
  } catch (error) {
    console.error("[ai-summary] Failed to generate product summary", error);
    return existing;
  }
}
