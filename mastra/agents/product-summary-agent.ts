import { Agent } from "@mastra/core/agent";

/**
 * Summarizes every review of a product into a short, neutral paragraph.
 *
 * The model string uses Mastra's provider/model router. It reads the key from
 * OPENAI_API_KEY at runtime; no AI SDK provider package is needed.
 */
export const productSummaryAgent = new Agent({
  id: "product-summary-agent",
  name: "Product Summary Agent",
  instructions: [
    "You write concise, neutral summaries of customer reviews for a product ratings website.",
    "Ground every statement in the reviews you receive. Never invent product features, prices, specifications, or quotes.",
    "Describe recurring opinions, the overall sentiment, and clear strengths or criticisms.",
    "Write in English, in 2 to 4 sentences, as plain text without Markdown, headings, or bullet points.",
    "Return only the summary text, with no introduction or closing remarks.",
  ].join(" "),
  model: "openai/gpt-4o-mini",
});
