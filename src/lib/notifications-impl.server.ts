/**
 * Sends transactional emails via Resend (https://resend.com)
 * Free 3,000 emails/month — NO CREDIT CARD REQUIRED.
 */
export async function sendEmail(input: {
  to: string | null;
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  const senderEmail = process.env["SENDER_EMAIL"] || "Sweet Crumb Bakery <onboarding@resend.dev>";

  if (!input.to || !apiKey) {
    console.info("[resend email skipped - configure RESEND_API_KEY in .env]", input);
    return;
  }

  try {
    const formattedHtml =
      input.html ||
      (input.text
        ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e1; border-radius: 20px; background-color: #fffdfa;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #43281c; margin: 0; font-size: 24px;">Sweet Crumb Bakery</h2>
          <p style="color: #8c7870; font-size: 13px; margin-top: 4px;">Fresh Artisan Bakes Daily</p>
        </div>
        <div style="color: #2b1e16; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${input.text}</div>
        <hr style="border: none; border-top: 1px solid #f0e6e1; margin: 24px 0 16px;" />
        <p style="color: #9c8982; font-size: 11px; text-align: center; margin: 0;">
          Sweet Crumb Bakery · Thank you for your order!
        </p>
      </div>`
        : undefined);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: formattedHtml,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[resend] email send failed [${response.status}]: ${errText}`);
    } else {
      console.info(`[resend] email successfully sent to ${input.to} (${input.subject})`);
    }
  } catch (err) {
    console.error("[resend] network error:", err);
  }
}

/** Sends an SMS or automated message when provider credentials exist, otherwise logs. */
export async function sendSms(to: string | null, body: string): Promise<void> {
  const twilioSid = process.env["TWILIO_ACCOUNT_SID"];
  const twilioToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromNumber = process.env["TWILIO_FROM_NUMBER"];

  if (!to || !twilioSid || !twilioToken || !fromNumber) {
    console.info("[sms/whatsapp background skipped - no credentials]", { to, body });
    return;
  }

  try {
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
      }
    );
    if (!response.ok) {
      console.error(`[sms] send failed [${response.status}]: ${await response.text()}`);
    }
  } catch (err) {
    console.error("[sms] network error:", err);
  }
}