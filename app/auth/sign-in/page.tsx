import { Star } from "lucide-react";
import type { Metadata } from "next";

import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 text-foreground">
      <span className="flex size-9 items-center justify-center rounded-md border border-border bg-card">
        <Star className="size-4 fill-signal text-signal" />
      </span>
      <span className="text-[0.9375rem] font-medium tracking-[-0.01em]">
        Product Ratings
      </span>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-dvh px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:items-center lg:gap-0">
        <section className="lg:pr-14 xl:pr-20">
          <BrandMark />

          <h1 className="reveal-once mt-12 max-w-[19ch] font-serif text-[clamp(2.75rem,5.2vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            Welcome back to your reviews.
          </h1>

          <p
            aria-hidden="true"
            className="mt-6 text-xl tracking-[0.42em] text-signal"
          >
            ★★★★★
          </p>

          <p className="mt-6 max-w-[38ch] text-[0.9375rem] leading-[1.7] text-muted-foreground text-pretty">
            Sign in to rate products and see what you have already reviewed.
          </p>
        </section>

        <section className="lg:border-l lg:border-border lg:pl-14 xl:pl-20">
          <div className="mx-auto w-full max-w-[27rem]">
            <div className="border-t border-border pt-8">
              <h2 className="text-[1.375rem] font-medium tracking-[-0.02em]">
                Sign in
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Use the email and password from your account.
              </p>
            </div>

            <div className="mt-8">
              <SignInForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
