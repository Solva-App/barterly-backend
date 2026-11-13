import logger from "@/utils/logger";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  logger.warn("RESEND_API_KEY is not defined in environment variables.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
