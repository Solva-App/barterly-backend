import { z } from "zod";

export const createChatSchema = z.object({
  body: z.object({
    listing_id: z.string().length(36, "Invalid listing ID"),
    offered_listing_id: z.string().length(36, "Invalid offered listing ID").optional().nullable(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    text: z
      .string()
      .min(1, "Message text is required")
      .max(2000, "Message exceeds 2000 characters"),
  }),
});

export const completeSwapSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

export const raiseDisputeSchema = z.object({
  body: z.object({
    note: z.string().min(5, "Dispute note must be at least 5 characters long").max(1000),
  }),
});
