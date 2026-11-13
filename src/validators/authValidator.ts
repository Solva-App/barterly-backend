import { z } from "zod";

const requiredString = (label: string) =>
  z.string({
    error: (issue) =>
      issue.input === undefined ? `${label} is required` : `${label} must be a string`,
  });

const emailField = z
  .email({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Invalid email address format",
  })
  .toLowerCase();

export const signupSchema = z.object({
  body: z.object({
    name: requiredString("Name").min(2, "Name must be at least 2 characters long"),
    username: requiredString("Username")
      .min(3, "Username must be at least 3 characters long")
      .toLowerCase(),
    email: emailField,
    password: requiredString("Password").min(6, "Password must be at least 6 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: requiredString("Password").min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: requiredString("Reset token").min(1, "Reset token is required"),
    newPassword: requiredString("New password").min(
      6,
      "New password must be at least 6 characters long"
    ),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: requiredString("Current password").min(1, "Current password is required"),
    newPassword: requiredString("New password").min(
      6,
      "New password must be at least 6 characters long"
    ),
  }),
});
