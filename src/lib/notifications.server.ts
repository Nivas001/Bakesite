import { sendEmail, sendSms } from "./notifications-impl.server";

function formatINR(value: number) {
  return `₹${Math.round(value)}`;
}

export async function notifyAdminNewOrder(input: {
  orderId: string;
  customerName: string | null;
  slot: string;
  total: number;
}): Promise<void> {
  const adminPhone = process.env["BAKERY_ADMIN_PHONE"] ?? null;
  const adminEmail = process.env["ADMIN_EMAIL"] ?? null;
  const shortId = input.orderId.slice(0, 8);

  const text = `New Sweet Crumb order #${shortId} from ${input.customerName ?? "a customer"} for ${input.slot} — ${formatINR(input.total)}. Please review and approve it in your bakery admin dashboard.`;

  if (adminPhone) {
    await sendSms(adminPhone, text);
  }
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New Order Received: #${shortId} (${formatINR(input.total)})`,
      text,
    });
  }
}

export async function notifyCustomerOrderUpdate(input: {
  orderId: string;
  status: string;
  phone: string | null;
  name: string | null;
  total: number;
  paymentLink?: string | null | undefined;
  email?: string | null | undefined;
}): Promise<void> {
  const shortId = input.orderId.slice(0, 8);
  const appUrl = process.env["APP_URL"] || "https://bakesite.vercel.app";
  const ordersPageUrl = `${appUrl}/orders`;

  const messages: Record<string, string> = {
    awaiting_payment: `Hi ${input.name ?? "there"},\n\nYour Sweet Crumb bakery order #${shortId} is approved!\n\nTotal: ${formatINR(input.total)}\n\nPlease view your order and complete payment on our website to secure your baking slot:\n👉 ${ordersPageUrl}\n\nSweet Crumb Bakery`,
    confirmed: `Hi ${input.name ?? "there"},\n\nYour Sweet Crumb bakery order #${shortId} is confirmed! Our bakers are preparing your fresh bakes for your scheduled slot.\n\nYou can track your order status anytime at:\n👉 ${ordersPageUrl}\n\nThank you for choosing Sweet Crumb!`,
    rejected: `Hi ${input.name ?? "there"},\n\nSorry, we are unable to accept order #${shortId} for that slot due to high bakery demand. Please feel free to choose another available time slot at ${appUrl}.\n\nSweet Crumb Bakery`,
  };

  const body = messages[input.status];
  if (!body) return;

  const subjects: Record<string, string> = {
    awaiting_payment: `Order #${shortId} Approved — Payment Link from Sweet Crumb`,
    confirmed: `Order #${shortId} Confirmed — Sweet Crumb Bakery`,
    rejected: `Order #${shortId} Update — Sweet Crumb Bakery`,
  };

  // 1. Send SMS / automated message if phone exists
  if (input.phone) {
    await sendSms(input.phone, body);
  }

  // 2. Send email via Resend if email exists
  if (input.email) {
    await sendEmail({
      to: input.email,
      subject: subjects[input.status] || `Order #${shortId} Update`,
      text: body,
    });
  }
}

export async function sendReviewRequest(input: {
  orderId: string;
  name: string | null;
  email?: string | null | undefined;
}): Promise<void> {
  await sendEmail({
    to: input.email ?? null,
    subject: "How were your bakes? — Sweet Crumb",
    text: `Hi ${input.name ?? "there"},\n\nThanks for ordering from Sweet Crumb! Tell us what you thought — leave a review on the products you tried.\n\nSweet Crumb Bakery`,
  });
}