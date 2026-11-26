import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

const optionalImage = z.preprocess((value) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return undefined;
  }

  return typeof value === "string" ? value.trim() : value;
}, z
  .url({ protocol: /^https?$/, error: "Enter a valid image URL." })
  .optional());

/**
 * Public payload for product ingestion.
 *
 * `link` is persisted as `external_link` and `image` as `image_url`.
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be at most 120 characters."),
  link: z.url({
    protocol: /^https?$/,
    error: "Enter a valid link.",
  }),
  image: optionalImage,
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
