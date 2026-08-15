export type NewsletterTemplateInput = {
  subject: string;
  body: string;
  campaign_type?: "announcement" | "weekly_special" | "promotion" | undefined;
  cta_label?: string | null | undefined;
  cta_url?: string | null | undefined;
  attachment_b64?: string | null | undefined;
  attachment_name?: string | null | undefined;
  attachment_mime?: string | null | undefined;
};

export const CAMPAIGN_PRESETS = {
  announcement: {
    label: "Announcement",
    icon: "📣",
    badge: "Bakery Announcement",
    badgeColor: "#c94a29",
    badgeBg: "#fcedea",
    defaultSubject: "Fresh News from Ani Bakes Counter",
    defaultBody: `Hi there,\n\nWe have some exciting news from our kitchen! Starting this week, we're introducing new morning baking slots and fresh seasonal recipes.\n\nEvery single item continues to be hand-mixed, slow-proofed, and baked fresh the morning of your chosen delivery slot.\n\nThank you for being part of our neighbourhood bakery family!`,
    defaultCtaLabel: "Browse the Counter →",
    defaultCtaUrl: "https://bakesite.vercel.app/shop",
  },
  weekly_special: {
    label: "Weekly Special",
    icon: "🎂",
    badge: "This Week's Specials",
    badgeColor: "#804e28",
    badgeBg: "#faede2",
    defaultSubject: "Special Bakes for This Weekend's Slots 🥐",
    defaultBody: `Hello sweet tooth,\n\nHere is what our bakers are pulling out of the ovens for this weekend's fresh slots:\n\n✨ Almond Croissant — Double baked with rich frangipane\n🍓 Strawberry Cream Slices — Fresh seasonal layers\n🍪 Triple Dark Chocolate Chunk Cookies — Crispy edges, molten centers\n\nSlots fill up quickly each morning. Reserve your next-day bake today!`,
    defaultCtaLabel: "Order Weekend Specials →",
    defaultCtaUrl: "https://bakesite.vercel.app/shop",
  },
  promotion: {
    label: "Promotion",
    icon: "🎟",
    badge: "Exclusive Subscriber Offer",
    badgeColor: "#9e3d60",
    badgeBg: "#fbeff3",
    defaultSubject: "A Sweet Treat for You — Special Discount Code 🎁",
    defaultBody: `Hi friend,\n\nAs a thank-you for being a subscriber to our fresh bakes newsletter, here is an exclusive discount for your next order!\n\nUse coupon code FRESH10 at checkout to get 10% off your entire box.\n\nValid on all next-day delivery and pickup slots. Happy indulging!`,
    defaultCtaLabel: "Use Your Discount Now →",
    defaultCtaUrl: "https://bakesite.vercel.app/offers",
  },
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBodyHtml(text: string): string {
  if (!text) return "";
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      const formatted = escapeHtml(p.trim()).replace(/\n/g, "<br />");
      return `<p style="margin: 0 0 16px 0; line-height: 1.7; font-size: 15px; color: #3d261b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatted}</p>`;
    })
    .join("");
}

export function buildNewsletterHtml(input: NewsletterTemplateInput): string {
  const type = input.campaign_type || "announcement";
  const preset = CAMPAIGN_PRESETS[type] || CAMPAIGN_PRESETS.announcement;

  const subject = input.subject || preset.defaultSubject;
  const bodyHtml = formatBodyHtml(input.body || preset.defaultBody);
  const ctaLabel = input.cta_label !== undefined ? input.cta_label : preset.defaultCtaLabel;
  const ctaUrl = input.cta_url || preset.defaultCtaUrl;

  const isImageAttachment =
    input.attachment_b64 &&
    input.attachment_mime &&
    input.attachment_mime.startsWith("image/");

  const isNonImageAttachment =
    input.attachment_b64 &&
    input.attachment_name &&
    !isImageAttachment;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap');
    
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f7f1eb;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f7f1eb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #fffaf5; border-radius: 24px; overflow: hidden; border: 1px solid #eeddd3; box-shadow: 0 12px 36px -12px rgba(67, 40, 28, 0.12);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ffeee8 0%, #fff4ed 100%); padding: 32px 28px 24px; text-align: center; border-bottom: 1px solid #f1ded5;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-size: 28px; line-height: 1; display: inline-block; margin-bottom: 6px;">🥐</span>
                    <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #381c10; letter-spacing: -0.01em;">
                      Ani Bakes
                    </h1>
                    <p style="margin: 4px 0 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: #946b5a;">
                      Fresh Small-Batch Bakes · Pondicherry
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px 24px;">
              
              <!-- Badge -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; background-color: ${preset.badgeBg}; color: ${preset.badgeColor}; font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 9999px; border: 1px solid ${preset.badgeColor}25;">
                  ${preset.badge}
                </span>
              </div>

              <!-- Optional Image Banner -->
              ${
                isImageAttachment
                  ? `<div style="margin-bottom: 24px; text-align: center;">
                      <img src="data:${input.attachment_mime};base64,${input.attachment_b64}" alt="${escapeHtml(subject)}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 16px; border: 1px solid #eeddd3;" />
                    </div>`
                  : ""
              }

              <!-- Heading / Subject -->
              <h2 style="margin: 0 0 18px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 23px; font-weight: 700; line-height: 1.35; color: #2e170c;">
                ${escapeHtml(subject)}
              </h2>

              <!-- Formatted Text Body -->
              <div style="margin-bottom: 24px;">
                ${bodyHtml}
              </div>

              <!-- Non-Image Attachment Notice -->
              ${
                isNonImageAttachment
                  ? `<div style="background-color: #f6ece3; border: 1px dashed #dfcbbe; border-radius: 12px; padding: 10px 14px; margin: 18px 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 12px; color: #624335;">
                      📎 <strong>Attached Document:</strong> ${escapeHtml(input.attachment_name || "Attachment")}
                    </div>`
                  : ""
              }

              <!-- Call To Action Button -->
              ${
                ctaLabel && ctaUrl
                  ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px;">
                      <tr>
                        <td align="center">
                          <a href="${escapeHtml(ctaUrl)}" target="_blank" style="background-color: #c94a29; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; display: inline-block; box-shadow: 0 6px 16px rgba(201, 74, 41, 0.28);">
                            ${escapeHtml(ctaLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7ede3; padding: 24px 28px; text-align: center; border-top: 1px solid #edd9cd;">
              <p style="margin: 0 0 6px; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 600; color: #43281c;">
                Ani Bakes Bakery
              </p>
              <p style="margin: 0 0 12px; font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; line-height: 1.5; color: #876c5f;">
                Everything is baked fresh the morning of your chosen slot · Pondicherry, India
              </p>
              <p style="margin: 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 10px; color: #aa9387;">
                You are receiving this email because you subscribed to our fresh bakes newsletter at Ani Bakes.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
