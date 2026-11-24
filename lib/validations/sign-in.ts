import { z } from "zod";

export const signInRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  // Passwords are compared byte-for-byte by bcrypt, so whitespace is kept.
  // bcrypt only considers the first 72 bytes of the password.
  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password must be at most 72 characters."),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;

export const signInFormSchema = signInRequestSchema;

export type SignInFormValues = z.infer<typeof signInFormSchema>;
