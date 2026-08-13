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
  await sendSms(
    adminPhone,
    `New Sweet Crumb order from ${input.customerName ?? "a customer"} for ${input.slot} — ${formatINR(input.total)}. Approve it in the admin dashboard.`,
  );
}

export async function notifyCustomerOrderUpdate(input: {
  orderId: string;
  status: string;
  phone: string | null;
  name: string | null;
  total: number;
  paymentLink?: string | null;
}): Promise<void> {
  const messages: Record<string, string> = {
    awaiting_payment: `Hi ${input.name ?? "there"}, your Sweet Crumb order is approved! Please pay ${formatINR(input.total)} to confirm your slot.${input.paymentLink ? ` Pay here: ${input.paymentLink}` : ""}`,
    confirmed: `Hi ${input.name ?? "there"}, your Sweet Crumb order is confirmed. We'll have it fresh for your slot.`,
    rejected: `Hi ${input.name ?? "there"}, sorry — we couldn't take your Sweet Crumb order for that slot. Please pick another time.`,
  };
  const body = messages[input.status];
  if (!body) return;
  await sendSms(input.phone, body);
}

export async function createPaymentLinkPlaceholder(input: {
  orderId: string;
  amount: number;
}): Promise<string | null> {
  // TODO(razorpay): create a payment link once the order is approved.
  console.info("[razorpay placeholder] payment link requested", input);
  return null;
}

export async function sendReviewRequest(input: {
  orderId: string;
  name: string | null;
  email?: string | null;
}): Promise<void> {
  await sendEmail({
    to: input.email ?? null,
    subject: "How were your bakes?",
    text: `Hi ${input.name ?? "there"}, thanks for ordering from Sweet Crumb. Tell us what you thought — leave a review on the products you tried.`,
  });
}