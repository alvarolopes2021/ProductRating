import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

const optionalDescription = z.preprocess(
  (value) =>
    value === null || (typeof value === "string" && value.trim() === "")
      ? undefined
      : value,
  z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters.")
    .optional(),
);

const optionalImageUrl = z.preprocess((value) => {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return undefined;
  }

  return typeof value === "string" ? value.trim() : value;
}, z
  .url({ protocol: /^https?$/, error: "Enter a valid image URL." })
  .optional());

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be at most 120 characters."),
  externalLink: z.url({
    protocol: /^https?$/,
    error: "Enter a valid external link.",
  }),
  description: optionalDescription,
  imageUrl: optionalImageUrl,
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
