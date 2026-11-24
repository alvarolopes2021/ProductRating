"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type SignUpFormValues,
  signUpFormSchema,
} from "@/lib/validations/sign-up";

type FieldErrors = Partial<Record<keyof SignUpFormValues, string[]>>;

type SignUpResponse = {
  account?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

class SignUpError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "SignUpError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function createAccount(values: SignUpFormValues) {
  const response = await fetch("/api/v1/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    }),
  });

  const payload = (await response
    .json()
    .catch(() => null)) as SignUpResponse | null;

  if (!response.ok) {
    const fieldErrors = (payload?.fieldErrors ?? {}) as FieldErrors;
    let message =
      payload?.error ?? "We couldn't save your account. Try again in a moment.";

    if (response.status === 409) {
      message = "That email is already registered. Try a different email.";
      fieldErrors.email = ["Use another email address."];
    } else if (response.status === 400 && Object.keys(fieldErrors).length > 0) {
      message = "Check the highlighted fields and try again.";
    }

    throw new SignUpError(message, response.status, fieldErrors);
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

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      router.push("/auth/sign-up/success");
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof SignUpError)) {
        return;
      }

      for (const [name, messages] of Object.entries(
        mutationError.fieldErrors,
      )) {
        if (!messages?.length) {
          continue;
        }

        form.setError(name as keyof SignUpFormValues, {
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

  function onSubmit(values: SignUpFormValues) {
    mutate(values);
  }

  const alertTitle =
    error instanceof SignUpError && error.status === 409
      ? "Email already registered"
      : error instanceof SignUpError && error.status === 400
        ? "Check the highlighted fields"
        : "Couldn't create your account";

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
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>{error?.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-4">
          <p className="text-sm font-medium">Your details</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      placeholder="Ada"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      placeholder="Lovelace"
                      className="h-11 text-[0.9375rem]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
        </div>

        <div className="space-y-4 border-t border-border pt-7">
          <p className="text-sm font-medium">Your sign-in</p>

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
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="h-11 pr-10 text-[0.9375rem]"
                      {...field}
                    />
                  </FormControl>
                  <PasswordToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((visible) => !visible)}
                  />
                </div>
                <FormDescription className="text-xs">
                  At least 8 characters, up to 72. Spaces and pasted passwords
                  work too.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className="h-11 pr-10 text-[0.9375rem]"
                      {...field}
                    />
                  </FormControl>
                  <PasswordToggle
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-[0.9375rem]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  );
}
