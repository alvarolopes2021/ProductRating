"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import {
  type SignInFormValues,
  signInFormSchema,
} from "@/lib/validations/sign-in";

type FieldErrors = Partial<Record<keyof SignInFormValues, string[]>>;

type SignInResponse = {
  account?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

class SignInError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "SignInError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function signIn(values: SignInFormValues) {
  const response = await fetch("/api/v1/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = (await response
    .json()
    .catch(() => null)) as SignInResponse | null;

  if (!response.ok) {
    const fieldErrors = (payload?.fieldErrors ?? {}) as FieldErrors;
    const message =
      payload?.error ?? "We couldn't sign you in. Try again in a moment.";

    throw new SignInError(message, response.status, fieldErrors);
  }

  return payload;
}

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof SignInError)) {
        return;
      }

      for (const [name, messages] of Object.entries(
        mutationError.fieldErrors,
      )) {
        if (!messages?.length) {
          continue;
        }

        form.setError(name as keyof SignInFormValues, {
          type: "server",
          message: messages[0],
        });
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

  function onSubmit(values: SignInFormValues) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-7"
        noValidate
      >
        {isError ? (
          <Alert variant="destructive" className="rounded-md shadow-none">
            <AlertCircle />
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>
              {error?.message ??
                "Email or password is invalid. Please try again."}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-4">
          <p className="text-sm font-medium">Your sign-in</p>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 text-[0.9375rem]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-11 pr-10 text-[0.9375rem]"
                      {...field}
                    />
                  </FormControl>
                  <PasswordToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((visible) => !visible)}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-[0.9375rem]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Create one.
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
