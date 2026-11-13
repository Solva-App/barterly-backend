import { z } from "zod";

export const createListingSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(60, "Title cannot exceed 60 characters"),
    category: z.string().min(2, "Category is required").max(60),
    state: z.string().min(2, "state location is required").max(30),
    want: z.string().min(3, "What you want in exchange is required").max(300),
    status: z.string().max(20).optional(),
  }),
});

export const getListingsQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    state: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
