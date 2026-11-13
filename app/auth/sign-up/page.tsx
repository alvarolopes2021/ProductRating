import { Check, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/components/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create your account",
};

const highlights = [
  "Rate the products you actually use",
  "Write reviews that help real people decide",
  "Keep track of everything you have tried",
];

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute -top-48 -left-48 -z-10 size-[34rem] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -bottom-48 -z-10 size-[34rem] rounded-full bg-violet-500/10 blur-3xl"
      />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <section className="hidden lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground"
          >
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-sm">
              <Star className="size-4 fill-current" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Product Ratings
            </span>
          </Link>

          <h1 className="mt-10 text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
            Every product deserves an{" "}
            <span className="text-primary">honest review.</span>
          </h1>

          <p className="text-muted-foreground mt-4 max-w-md text-lg text-pretty">
            Create your account to rate products, share your experience and help
            others make better choices.
          </p>

          <ul className="mt-8 space-y-3">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-3.5" />
                </span>
                <span className="text-muted-foreground text-sm">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-sm">
              <Star className="size-4 fill-current" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Product Ratings
            </span>
          </div>

          <Card className="shadow-primary/5 shadow-xl">
            <CardHeader className="gap-1.5">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                It only takes a minute. Start reviewing right away.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignUpForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
