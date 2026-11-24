import { Star } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const session = await getSession();
  const account = session?.account;
  const fullName = account
    ? `${account.firstName} ${account.lastName}`.trim()
    : "";

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Product Ratings home"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
            <Star className="size-4 fill-signal text-signal" />
          </span>
          <span className="truncate text-[0.9375rem] font-medium tracking-[-0.01em]">
            Product Ratings
          </span>
        </Link>

        {account ? (
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {/* External SVG avatar: next/image would require a remote pattern. */}
            {/* biome-ignore lint/performance/noImgElement: Dicebear serves a remote SVG. */}
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(account.id)}`}
              alt={`${fullName}'s avatar`}
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full border border-border bg-muted"
            />
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] leading-tight font-medium">
                {fullName}
              </p>
              <p className="truncate text-[0.75rem] leading-tight text-muted-foreground">
                {account.email}
              </p>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
