/**
 * Sends transactional emails via Resend (https://resend.com)
 * Free 3,000 emails/month — NO CREDIT CARD REQUIRED.
 */
export type EmailAttachment = {
  filename: string;
  content: string;
  content_type?: string | undefined;
};

export async function sendEmail(input: {
  to: string | null;
  subject: string;
  text?: string | undefined;
  html?: string | undefined;
  attachments?: EmailAttachment[] | undefined;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  const bakeryName = process.env["BAKERY_NAME"] || "Ani Bakes";
  const senderEmail = process.env["SENDER_EMAIL"] || `${bakeryName} <orders@anibakes.app>`;

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
          <h2 style="color: #43281c; margin: 0; font-size: 24px;">${bakeryName}</h2>
          <p style="color: #8c7870; font-size: 13px; margin-top: 4px;">Fresh Artisan Bakes Daily</p>
        </div>
        <div style="color: #2b1e16; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${input.text}</div>
        <hr style="border: none; border-top: 1px solid #f0e6e1; margin: 24px 0 16px;" />
        <p style="color: #9c8982; font-size: 11px; text-align: center; margin: 0;">
          ${bakeryName} · Thank you for your order!
        </p>
      </div>`
        : undefined);

    const payload: Record<string, unknown> = {
      from: senderEmail,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: formattedHtml,
    };

    if (input.attachments && input.attachments.length > 0) {
      payload["attachments"] = input.attachments;
    }

    let response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && !senderEmail.includes("onboarding@resend.dev")) {
      // Retry with sandbox sender if custom domain has temporary propagation delay
      payload["from"] = `${bakeryName} <onboarding@resend.dev>`;
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

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

/**
 * Automated WhatsApp message delivery via Meta WhatsApp Cloud API, Fast2SMS, or Twilio WhatsApp.
 * Delivers directly to the customer's phone number in the background without opening WhatsApp.
 */
export async function sendWhatsAppMessage(toPhone: string | null, message: string): Promise<void> {
  if (!toPhone) return;

  const cleanDigits = toPhone.replace(/\D/g, "");
  const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

  // 1. Meta WhatsApp Cloud API (Official WhatsApp API — Free 1,000 conversations/month)
  const metaToken = process.env["META_WHATSAPP_TOKEN"];
  const metaPhoneId = process.env["META_PHONE_NUMBER_ID"];
  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneWithCountry,
          type: "text",
          text: { preview_url: true, body: message },
        }),
      });
      if (!res.ok) {
        console.error(`[meta whatsapp] send failed [${res.status}]:`, await res.text());
      } else {
        console.info(`[meta whatsapp] automated message sent to ${phoneWithCountry}`);
        return;
      }
    } catch (err) {
      console.error("[meta whatsapp] network error:", err);
    }
  }

  // 2. Fast2SMS / Indian Gateway (No Credit Card required — UPI top-up)
  const fast2smsKey = process.env["FAST2SMS_API_KEY"];
  if (fast2smsKey) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "v3",
          sender_id: "TXTIND",
          message: message,
          language: "english",
          numbers: cleanDigits.slice(-10),
        }),
      });
      console.info("[fast2sms] automated notification dispatched", await res.text());
      return;
    } catch (err) {
      console.error("[fast2sms] network error:", err);
    }
  }

  // 3. Twilio WhatsApp
  const twilioSid = process.env["TWILIO_ACCOUNT_SID"];
  const twilioToken = process.env["TWILIO_AUTH_TOKEN"];
  const twilioFrom = process.env["TWILIO_WHATSAPP_FROM"];
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: `whatsapp:+${phoneWithCountry}`,
            From: twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`,
            Body: message,
          }),
        }
      );
      if (!res.ok) {
        console.error(`[twilio whatsapp] send failed [${res.status}]: ${await res.text()}`);
      } else {
        console.info(`[twilio whatsapp] automated message sent to +${phoneWithCountry}`);
      }
    } catch (err) {
      console.error("[twilio whatsapp] network error:", err);
    }
  }
}

/** Sends an SMS or automated message when provider credentials exist, otherwise logs. */
export async function sendSms(to: string | null, body: string): Promise<void> {
  const twilioSid = process.env["TWILIO_ACCOUNT_SID"];
  const twilioToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromNumber = process.env["TWILIO_FROM_NUMBER"];

  if (!to || !twilioSid || !twilioToken || !fromNumber) {
    console.info("[sms skipped - no twilio sms credentials]", { to, body });
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