import { ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackList } from "@/components/feedback-list";
import { Button } from "@/components/ui/button";
import { ensureProductSummary } from "@/lib/ai/product-summary";
import { getSession } from "@/lib/auth/session";
import { listFeedback } from "@/lib/feedback";
import { getProductById } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [feedback, session] = await Promise.all([
    listFeedback(product.id),
    getSession(),
  ]);

  const aiSummary = await ensureProductSummary(product, feedback);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] md:items-start md:gap-14">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            All products
          </Link>

          <h1 className="reveal-once mt-7 max-w-[18ch] font-serif text-[clamp(2.75rem,5vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            {product.name}
          </h1>

          {product.description ? (
            <p className="mt-6 max-w-[56ch] text-[0.9375rem] leading-[1.8] text-muted-foreground text-pretty">
              {product.description}
            </p>
          ) : null}

          <Link
            href={product.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Visit website
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {product.imageUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-secondary">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-border bg-secondary">
            <span className="px-8 text-center font-serif text-4xl leading-tight tracking-[-0.02em] text-muted-foreground">
              {product.name}
            </span>
          </div>
        )}
      </div>

      {aiSummary ? (
        <section
          aria-labelledby="ai-summary-title"
          className="mt-14 border-l-2 border-signal bg-signal/[0.04] px-5 py-6 sm:px-7"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Sparkles className="size-4 text-signal" aria-hidden="true" />
            <h2
              id="ai-summary-title"
              className="text-sm font-medium tracking-[-0.01em]"
            >
              AI summary
            </h2>
            <span className="rounded-sm border border-signal/35 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.12em] text-signal">
              AI
            </span>
          </div>
          <p className="mt-4 max-w-[70ch] font-serif text-[1.25rem] leading-relaxed tracking-[-0.01em] text-balance">
            {aiSummary}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Generated from {feedback.length}{" "}
            {feedback.length === 1 ? "review" : "reviews"}. AI can make
            mistakes.
          </p>
        </section>
      ) : feedback.length > 0 ? (
        <section className="mt-14 border-l-2 border-border px-5 py-5 sm:px-7">
          <p className="text-sm text-muted-foreground">
            AI summary is unavailable right now.
          </p>
        </section>
      ) : null}

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-5">
          <h2 className="font-serif text-[1.875rem] tracking-[-0.025em]">
            Reviews
          </h2>
          <span className="text-sm tabular-nums text-muted-foreground">
            {feedback.length === 1 ? "1 review" : `${feedback.length} reviews`}
          </span>
        </div>

        <FeedbackList feedback={feedback} />
      </section>

      <section className="mt-14 border-t border-border pt-8">
        {session ? (
          <>
            <h2 className="text-[1.375rem] font-medium tracking-[-0.02em]">
              Add your review
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Rate this product and share what you think.
            </p>
            <div className="mt-7 max-w-xl">
              <FeedbackForm productId={product.id} />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-[1.375rem] font-medium tracking-[-0.02em]">
                Sign in to leave a review.
              </h2>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Your rating helps others choose with confidence.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
