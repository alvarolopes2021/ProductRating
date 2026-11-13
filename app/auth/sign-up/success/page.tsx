import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account created",
};

export default function SignUpSuccessPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute -top-48 -left-48 -z-10 size-[34rem] rounded-full blur-3xl"
      />

      <div className="bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-xl shadow-emerald-500/5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Your account is ready
        </h1>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">
          Welcome to Product Ratings. You can now sign in and start sharing your
          honest reviews.
        </p>

        <Button asChild size="lg" className="mt-8 w-full">
          <Link href="/">Go to home</Link>
        </Button>
      </div>
    </main>
  );
}
