import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .toLowerCase()
      .optional(),
    bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
    phone: z.string().optional(),
    avatar_url: z.string().url("Invalid avatar URL format").optional(),
  }),
});

export const verificationSchema = z.object({
  body: z.object({
    document_type: z.enum(["national_id", "passport", "drivers_license", "student_id"]),
    document_number: z.string().min(3, "Document number is required"),
  }),
});
