import { Check, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account created",
};

export default function SignUpSuccessPage() {
  return (
    <main className="flex min-h-dvh items-center px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-2.5 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-card">
            <Star className="size-4 fill-signal text-signal" />
          </span>
          <span className="text-[0.9375rem] font-medium tracking-[-0.01em]">
            Product Ratings
          </span>
        </div>

        <div className="mt-16 border-t border-border pt-8 lg:mt-20">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="size-4" />
          </span>

          <h1 className="reveal-once mt-6 max-w-[18ch] font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-[-0.035em]">
            Your account is ready.
          </h1>

          <p className="mt-5 max-w-[45ch] text-[0.9375rem] leading-[1.7] text-muted-foreground text-pretty">
            Thanks for joining Product Ratings. We saved your details and your
            account is ready whenever you are.
          </p>
        </div>
      </div>
    </main>
  );
}
