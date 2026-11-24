import { z } from "zod";

const ratingMessage = "Choose a rating from 1 to 5.";

export const feedbackRequestSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  score: z.coerce
    .number()
    .int(ratingMessage)
    .min(1, ratingMessage)
    .max(5, ratingMessage),
  comment: z
    .string()
    .trim()
    .min(1, "Write a comment about the product.")
    .max(1000, "Keep your comment under 1000 characters."),
});

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

export const feedbackFormSchema = z.object({
  score: z
    .number()
    .int(ratingMessage)
    .min(1, ratingMessage)
    .max(5, ratingMessage),
  comment: z
    .string()
    .trim()
    .min(1, "Write a comment about the product.")
    .max(1000, "Keep your comment under 1000 characters."),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
