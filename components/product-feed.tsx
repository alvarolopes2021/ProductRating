"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

const PAGE_SIZE = 12;
const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six"];

type ProductsPage = {
  items: Product[];
  nextPage: number | null;
};

type ProductFeedProps = {
  initialPage: ProductsPage;
  initialError?: string | null;
};

async function fetchProducts(page: number): Promise<ProductsPage> {
  const response = await fetch(
    `/api/v1/products?page=${page}&limit=${PAGE_SIZE}`,
  );

  if (!response.ok) {
    throw new Error("We couldn't load products.");
  }

  return (await response.json()) as ProductsPage;
}

export function ProductFeed({
  initialPage,
  initialError = null,
}: ProductFeedProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestingRef = useRef(false);

  const {
    data,
    error,
    isError,
    isFetchNextPageError,
    isFetching,
    isFetchingNextPage,
    isPending,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam }) => fetchProducts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialData: initialError
      ? undefined
      : { pages: [initialPage], pageParams: [1] },
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || requestingRef.current) {
          return;
        }

        requestingRef.current = true;
        void fetchNextPage().finally(() => {
          requestingRef.current = false;
        });
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const initialLoadFailed = Boolean(initialError) && !data;
  const queryFailed = isError && !data;
  const showError = initialLoadFailed || queryFailed;
  const showSkeleton = isPending && !data && !showError;

  if (showError) {
    return (
      <section className="mt-8 sm:mt-10" aria-label="Product feed status">
        <div role="alert" className="border border-border px-6 py-12 sm:px-8">
          <h2 className="font-serif text-2xl">
            {initialError ?? error?.message ?? "We couldn't load products."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 shadow-none"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
          >
            Try again
          </Button>
        </div>
      </section>
    );
  }

  if (showSkeleton) {
    return (
      <section
        className="mt-8 sm:mt-10"
        aria-label="Loading products"
        aria-busy="true"
      >
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="bg-background p-5 sm:p-6">
              <div className="aspect-[16/10] w-full bg-secondary" />
              <div className="mt-5 h-6 w-2/3 bg-secondary" />
              <div className="mt-3 h-4 w-full bg-secondary" />
              <div className="mt-2 h-4 w-4/5 bg-secondary" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mt-8 sm:mt-10" aria-live="polite">
        <p className="font-serif text-2xl">No products yet.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 sm:mt-10" aria-label="Products">
      <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div
        aria-live="polite"
        className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 py-5 text-sm text-muted-foreground"
      >
        {isFetchingNextPage ? <span>Loading more products…</span> : null}

        {isFetchNextPageError && !isFetchingNextPage ? (
          <>
            <span>We couldn't load more products.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shadow-none"
              onClick={() => {
                void fetchNextPage();
              }}
            >
              Try again
            </Button>
          </>
        ) : null}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
    </section>
  );
}
