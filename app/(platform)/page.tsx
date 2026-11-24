import { connection } from "next/server";

import { ProductFeed } from "@/components/product-feed";
import { listProducts } from "@/lib/products";

export default async function HomePage() {
  await connection();

  let initialPage: Awaited<ReturnType<typeof listProducts>> = {
    items: [],
    nextPage: null,
  };
  let initialError: string | null = null;

  try {
    initialPage = await listProducts(1, 12);
  } catch (error) {
    console.error("[home] Failed to load products", error);
    initialError = "We couldn't load products right now.";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <header className="max-w-3xl">
        <h1 className="text-balance font-serif text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.025em]">
          Products worth talking about.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A public catalog of products people use and talk about. Browse freely,
          no account needed.
        </p>
      </header>

      <div className="mt-12 h-px w-full bg-border sm:mt-16" />

      <ProductFeed initialPage={initialPage} initialError={initialError} />
    </div>
  );
}
