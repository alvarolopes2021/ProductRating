"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type FeedbackFormValues,
  feedbackFormSchema,
} from "@/lib/validations/feedback";

type FeedbackFieldErrors = Partial<Record<keyof FeedbackFormValues, string[]>>;

type FeedbackResponse = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

class FeedbackError extends Error {
  readonly fieldErrors: FeedbackFieldErrors;

  constructor(message: string, fieldErrors: FeedbackFieldErrors = {}) {
    super(message);
    this.name = "FeedbackError";
    this.fieldErrors = fieldErrors;
  }
}

async function submitFeedback(
  productId: string,
  values: FeedbackFormValues,
): Promise<FeedbackResponse | null> {
  const response = await fetch("/api/v1/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      score: values.score,
      comment: values.comment,
    }),
  });

  const payload = (await response
    .json()
    .catch(() => null)) as FeedbackResponse | null;

  if (!response.ok) {
    throw new FeedbackError(
      response.status === 401
        ? "Sign in to leave a review."
        : (payload?.error ?? "We couldn't add your review. Try again."),
      (payload?.fieldErrors ?? {}) as FeedbackFieldErrors,
    );
  }

  return payload;
}

const scores = [1, 2, 3, 4, 5] as const;

export function FeedbackForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { score: 0, comment: "" },
    mode: "onTouched",
  });

  const commentLength = form.watch("comment").length;

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: (values: FeedbackFormValues) =>
      submitFeedback(productId, values),
    onMutate: () => setConfirmation(null),
    onSuccess: () => {
      form.reset();
      setConfirmation("Review added.");
      router.refresh();
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof FeedbackError)) {
        return;
      }

      for (const [name, messages] of Object.entries(
        mutationError.fieldErrors,
      )) {
        if ((name !== "score" && name !== "comment") || !messages?.length) {
          continue;
        }

        form.setError(name, { type: "server", message: messages[0] });
      }
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (isError) {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isError, reset]);

  function onSubmit(values: FeedbackFormValues) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {isError ? (
          <Alert variant="destructive" className="rounded-md shadow-none">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t add your review</AlertTitle>
            <AlertDescription>{error?.message}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="score"
          render={({ field, fieldState }) => (
            <FormItem>
              <fieldset
                aria-describedby={fieldState.error ? "score-error" : undefined}
              >
                <legend className="text-sm leading-none font-medium">
                  Your rating
                </legend>
                <div className="mt-3 flex items-center gap-1.5">
                  {scores.map((value) => {
                    const selected = field.value >= value;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} out of 5 stars`}
                        aria-pressed={field.value === value}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          selected &&
                            "border-signal/50 bg-signal/10 text-signal",
                        )}
                      >
                        <Star
                          className={cn("size-5", selected && "fill-current")}
                        />
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <FormMessage id="score-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did you like or dislike?"
                  maxLength={1000}
                  className="text-[0.9375rem]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="ml-auto text-xs tabular-nums text-muted-foreground">
                {commentLength}/1000
              </p>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding review…
              </>
            ) : (
              "Add review"
            )}
          </Button>
          {confirmation ? (
            <p aria-live="polite" className="text-sm text-success">
              {confirmation}
            </p>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
