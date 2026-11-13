import mjml2html from "mjml";

const wrapWithLayout = async (
  content: string,
  primaryColor: string = "#10b981"
): Promise<string> => {
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
          <mj-text font-size="16px" color="#333333" line-height="1.6" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f7">
        <mj-section background-color="${primaryColor}" padding="20px">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="24px" font-weight="bold">
              Barterly
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="30px" border-radius="8px">
          <mj-column>
            ${content}
          </mj-column>
        </mj-section>

        <mj-section padding="20px">
          <mj-column>
            <mj-text align="center" color="#666666" font-size="12px">
              &copy; ${new Date().getFullYear()} Barterly. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const result = await mjml2html(mjmlTemplate, { validationLevel: "soft" });

  if (result?.errors && result.errors.length > 0) {
    console.warn("MJML Compilation Warnings:", result.errors);
  }

  if (!result?.html) {
    console.error("Raw MJML output:", result);
    throw new Error("MJML compilation failed to produce HTML output");
  }

  return result.html;
};

// 1. Welcome Email
export const getWelcomeEmailHtml = async (name: string): Promise<string> => {
  const content = `
    <mj-text>Hi <strong>${name}</strong>,</mj-text>
    <mj-text>We are thrilled to have you join Barterly—your community exchange and bartering platform. Swap items effortlessly, connect with people in your state, and give unused items a new home.</mj-text>
    <mj-button background-color="#10b981" color="white" href="${process.env.CLIENT_URL || "http://localhost:3000"}/listings" font-weight="bold">
      Explore Listings
    </mj-button>
  `;
  return wrapWithLayout(content, "#10b981");
};

// 2. Password Reset Email
export const getPasswordResetEmailHtml = async (resetToken: string): Promise<string> => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  const content = `
    <mj-text>You requested a password reset for your Barterly account.</mj-text>
    <mj-text>Click the button below to reset your password. This link is valid for 10 minutes:</mj-text>
    <mj-button background-color="#ef4444" color="white" href="${resetUrl}" font-weight="bold">
      Reset Password
    </mj-button>
    <mj-text font-size="12px" color="#666666">If you didn't request this, you can safely ignore this email.</mj-text>
  `;
  return wrapWithLayout(content, "#ef4444");
};

// 3. Chat Notification Email
export const getChatNotificationEmailHtml = async (
  recipientName: string,
  senderName: string,
  listingTitle: string
): Promise<string> => {
  const content = `
    <mj-text>Hi <strong>${recipientName}</strong>,</mj-text>
    <mj-text><strong>${senderName}</strong> sent you a message regarding your listing: <em>"${listingTitle}"</em>.</mj-text>
    <mj-button background-color="#3b82f6" color="white" href="${process.env.CLIENT_URL || "http://localhost:3000"}/chats" font-weight="bold">
      View Conversation
    </mj-button>
  `;
  return wrapWithLayout(content, "#3b82f6");
};
