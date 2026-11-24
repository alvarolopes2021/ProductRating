import { formatDistanceToNow } from "date-fns";

import type { ProductFeedback } from "@/lib/feedback";

export function FeedbackList({ feedback }: { feedback: ProductFeedback[] }) {
  if (feedback.length === 0) {
    return (
      <p className="border-t border-border py-8 text-sm leading-relaxed text-muted-foreground">
        No reviews yet. Share what you think about this product.
      </p>
    );
  }

  return (
    <ul className="border-t border-border">
      {feedback.map((item) => (
        <li key={item.id} className="border-b border-border py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
            <span
              role="img"
              aria-label={`${item.score} out of 5 stars`}
              className="text-[0.9375rem] tracking-[0.14em] text-signal"
            >
              <span aria-hidden="true">{"★".repeat(item.score)}</span>
              <span aria-hidden="true" className="text-border">
                {"★".repeat(5 - item.score)}
              </span>
            </span>
            <time
              dateTime={item.createdAt}
              className="text-xs text-muted-foreground"
            >
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </time>
          </div>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-[1.7] text-foreground/85 whitespace-pre-wrap">
            {item.comment}
          </p>
        </li>
      ))}
    </ul>
  );
}
