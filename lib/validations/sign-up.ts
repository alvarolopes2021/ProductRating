import { z } from "zod";

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters.`)
    .max(50, `${label} must be at most 50 characters.`);

export const signUpRequestSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  // bcrypt only considers the first 72 bytes of the password.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export const signUpFormSchema = signUpRequestSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
