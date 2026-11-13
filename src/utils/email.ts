import logger from "@/utils/logger";
import { Resend } from "resend";
import {
  getWelcomeEmailHtml,
  getPasswordResetEmailHtml,
  getChatNotificationEmailHtml,
} from "@/utils/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from = "Barterly <onboarding@resend.dev>",
}: SendEmailOptions) => {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("Resend API Error:", error);
    throw new Error(error.message);
  }

  logger.info(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`);
  return data;
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: "Welcome to Barterly!",
    html: await getWelcomeEmailHtml(name),
  });
};

export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
  return sendEmail({
    to,
    subject: "Reset your Barterly password",
    html: await getPasswordResetEmailHtml(resetToken),
  });
};

export const sendChatNotificationEmail = async (
  to: string,
  recipientName: string,
  senderName: string,
  listingTitle: string
) => {
  return sendEmail({
    to,
    subject: `New message regarding "${listingTitle}"`,
    html: await getChatNotificationEmailHtml(recipientName, senderName, listingTitle),
  });
};
