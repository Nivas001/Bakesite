export type NewsletterTemplateInput = {
  subject: string;
  body: string;
  campaign_type?: "announcement" | "weekly_special" | "promotion" | undefined;
  cta_label?: string | null | undefined;
  cta_url?: string | null | undefined;
  attachment_b64?: string | null | undefined;
  attachment_name?: string | null | undefined;
  attachment_mime?: string | null | undefined;

  // Featured Bake / Cake Showcase
  showcase_enabled?: boolean | undefined;
  showcase_image?: string | null | undefined;
  showcase_title?: string | null | undefined;
  showcase_tag?: string | null | undefined;
  showcase_description?: string | null | undefined;
  showcase_layout?: "side_by_side" | "stacked" | undefined;
  showcase_link?: string | null | undefined;
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
    defaultCtaUrl: "https://anibakes.app/shop",
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
    defaultCtaUrl: "https://anibakes.app/shop",
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
    defaultCtaUrl: "https://anibakes.app/offers",
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

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `https://anibakes.app${cleanPath}`;
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

  // Showcase variables
  const showcaseEnabled = Boolean(input.showcase_enabled);
  const showcaseImgRaw = input.showcase_image || "";
  const showcaseImg = resolveImageUrl(showcaseImgRaw);
  const showcaseTitle = input.showcase_title || "";
  const showcaseTag = input.showcase_tag || "";
  const showcaseDesc = input.showcase_description || "";
  const showcaseLayout = input.showcase_layout || "side_by_side";
  const showcaseLink = input.showcase_link || "";

  let showcaseHtml = "";
  if (showcaseEnabled && (showcaseTitle || showcaseImg)) {
    if (showcaseLayout === "side_by_side" && showcaseImg) {
      showcaseHtml = `
      <!-- Featured Product Showcase (Side by Side) -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #fff4ed; border: 1px solid #f1ded5; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px -4px rgba(67, 40, 28, 0.08);">
        <tr>
          <td style="padding: 16px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <!-- Left Col: Photo -->
                <td class="showcase-stack" width="46%" valign="top" style="padding-right: 14px;">
                  <img src="${escapeHtml(showcaseImg)}" alt="${escapeHtml(showcaseTitle)}" class="showcase-img" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 14px; display: block; border: 1px solid #eeddd3;" />
                </td>
                <!-- Right Col: Details -->
                <td class="showcase-stack" width="54%" valign="middle" style="padding-top: 4px;">
                  ${
                    showcaseTag
                      ? `<span style="display: inline-block; background-color: #c94a29; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 9999px; margin-bottom: 6px;">${escapeHtml(showcaseTag)}</span>`
                      : ""
                  }
                  <h3 style="margin: 4px 0 6px 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 700; line-height: 1.3; color: #2e170c;">
                    ${escapeHtml(showcaseTitle)}
                  </h3>
                  ${
                    showcaseDesc
                      ? `<p style="margin: 0 0 10px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #6b4d3f;">${escapeHtml(showcaseDesc)}</p>`
                      : ""
                  }
                  ${
                    showcaseLink
                      ? `<a href="${escapeHtml(showcaseLink)}" target="_blank" style="display: inline-block; color: #c94a29; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; font-weight: 700; text-decoration: none;">View Cake & Order →</a>`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
    } else {
      // Stacked Layout (Photo on top, details below)
      showcaseHtml = `
      <!-- Featured Product Showcase (Stacked) -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #fff4ed; border: 1px solid #f1ded5; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px -4px rgba(67, 40, 28, 0.08);">
        <tr>
          <td>
            ${
              showcaseImg
                ? `<img src="${escapeHtml(showcaseImg)}" alt="${escapeHtml(showcaseTitle)}" style="width: 100%; max-height: 240px; object-fit: cover; display: block;" />`
                : ""
            }
            <div style="padding: 18px 20px;">
              ${
                showcaseTag
                  ? `<span style="display: inline-block; background-color: #c94a29; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 9999px; margin-bottom: 8px;">${escapeHtml(showcaseTag)}</span>`
                  : ""
              }
              <h3 style="margin: 4px 0 8px 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; line-height: 1.3; color: #2e170c;">
                ${escapeHtml(showcaseTitle)}
              </h3>
              ${
                showcaseDesc
                  ? `<p style="margin: 0 0 14px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #6b4d3f;">${escapeHtml(showcaseDesc)}</p>`
                  : ""
              }
              ${
                showcaseLink
                  ? `<a href="${escapeHtml(showcaseLink)}" target="_blank" style="display: inline-block; background-color: #c94a29; color: #ffffff; text-decoration: none; padding: 8px 20px; border-radius: 9999px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(201, 74, 41, 0.25);">View & Order Cake →</a>`
                  : ""
              }
            </div>
          </td>
        </tr>
      </table>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap');
    
    h1, h2, h3, .serif-heading {
      font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
    }
    body, td, p, a, li, blockquote, .sans-body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }

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

    @media only screen and (max-width: 600px) {
      .showcase-stack {
        display: block !important;
        width: 100% !important;
        padding-right: 0 !important;
        padding-left: 0 !important;
      }
      .showcase-img {
        max-height: 220px !important;
        margin-bottom: 12px !important;
      }
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
                    <h1 class="serif-heading" style="margin: 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #381c10; letter-spacing: -0.01em;">
                      Ani Bakes
                    </h1>
                    <p style="margin: 4px 0 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: #946b5a;">
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
                <span style="display: inline-block; background-color: ${preset.badgeBg}; color: ${preset.badgeColor}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 9999px; border: 1px solid ${preset.badgeColor}25;">
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
              <h2 class="serif-heading" style="margin: 0 0 18px 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 23px; font-weight: 700; line-height: 1.35; color: #2e170c;">
                ${escapeHtml(subject)}
              </h2>

              <!-- Formatted Text Body -->
              <div style="margin-bottom: 20px;">
                ${bodyHtml}
              </div>

              <!-- Featured Bake Showcase Block -->
              ${showcaseHtml}

              <!-- Non-Image Attachment Notice -->
              ${
                isNonImageAttachment
                  ? `<div style="background-color: #f6ece3; border: 1px dashed #dfcbbe; border-radius: 12px; padding: 10px 14px; margin: 18px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; color: #624335;">
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
                          <a href="${escapeHtml(ctaUrl)}" target="_blank" style="background-color: #c94a29; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; display: inline-block; box-shadow: 0 6px 16px rgba(201, 74, 41, 0.28);">
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
            <td style="background-color: #f7ede3; padding: 26px 28px 24px; text-align: center; border-top: 1px solid #edd9cd;">
              <p class="serif-heading" style="margin: 0 0 4px; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 700; color: #43281c;">
                Ani Bakes Bakery
              </p>
              <p style="margin: 0 0 14px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #876c5f;">
                Everything is baked fresh the morning of your chosen slot · Pondicherry, India
              </p>
              
              <!-- Cool Bakery Unsubscribe Box -->
              <div style="background-color: #efe2d6; border-radius: 14px; padding: 12px 16px; margin-top: 4px; display: inline-block; max-width: 440px;">
                <p style="margin: 0 0 4px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #6e4e40; font-weight: 500;">
                  Too full on pastries or watching your sugar? 🧁<br />
                  You can <a href="https://anibakes.app/unsubscribe" target="_blank" style="color: #c94a29; font-weight: 700; text-decoration: underline;">take a sweet break &amp; unsubscribe</a> anytime.
                </p>
                <p style="margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10px; color: #9c8072; font-style: italic;">
                  Our ovens will still be warm whenever you crave that fresh bake aroma again. 🥐
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
