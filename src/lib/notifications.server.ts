import { sendEmail, sendSms, sendWhatsAppMessage } from "./notifications-impl.server";

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

  const text = `New Paid Sweet Crumb order #${shortId} from ${input.customerName ?? "a customer"} for ${input.slot} — ${formatINR(input.total)}. Review and confirm kitchen baking schedule in your admin dashboard.`;

  if (adminPhone) {
    await sendSms(adminPhone, text);
  }
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New Paid Order Received: #${shortId} (${formatINR(input.total)})`,
      text,
    });
  }
}

export async function notifyCustomerOrderPlaced(input: {
  orderId: string;
  name: string | null;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  slot: string;
  total: number;
}): Promise<void> {
  const shortId = input.orderId.slice(0, 8);
  const appUrl = process.env["APP_URL"] || "https://bakesite.vercel.app";
  const ordersPageUrl = `${appUrl}/orders`;

  const body = `Hi ${input.name ?? "there"},\n\nThank you for ordering with Sweet Crumb Bakery!\n\nWe have received your payment of ${formatINR(input.total)} for order #${shortId}.\n\n🕒 Requested Slot: ${input.slot}\n👨‍🍳 Status: In Kitchen Queue — The head baker is reviewing oven capacity & scheduling your fresh bakes.\n\nYou can track your live order status anytime here:\n👉 ${ordersPageUrl}\n\nSweet Crumb Bakery`;

  if (input.email) {
    await sendEmail({
      to: input.email,
      subject: `Order #${shortId} Received & Paid (${formatINR(input.total)}) — Sweet Crumb Bakery`,
      text: body,
    });
  }

  if (input.phone) {
    await sendWhatsAppMessage(input.phone, body);
    await sendSms(input.phone, body);
  }
}

export async function notifyCustomerOrderRescheduled(input: {
  orderId: string;
  name: string | null;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  newSlot: string;
  reason?: string | null | undefined;
}): Promise<void> {
  const shortId = input.orderId.slice(0, 8);
  const appUrl = process.env["APP_URL"] || "https://bakesite.vercel.app";
  const ordersPageUrl = `${appUrl}/orders`;

  const reasonText = input.reason?.trim() ? `\n📝 Note from Head Baker: "${input.reason.trim()}"` : "";

  const body = `Hi ${input.name ?? "there"},\n\nYour baking schedule for Sweet Crumb order #${shortId} has been updated by the head baker.\n\n🕒 New Scheduled Slot: ${input.newSlot}${reasonText}\n\nOur kitchen will prepare your bakes fresh for this updated time. You can view full details on your orders page:\n👉 ${ordersPageUrl}\n\nThank you for your understanding!\nSweet Crumb Bakery`;

  if (input.email) {
    await sendEmail({
      to: input.email,
      subject: `Important: Order #${shortId} Baking Schedule Updated — Sweet Crumb Bakery`,
      text: body,
    });
  }

  if (input.phone) {
    await sendWhatsAppMessage(input.phone, body);
    await sendSms(input.phone, body);
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
    pending_approval: `Hi ${input.name ?? "there"},\n\nYour Sweet Crumb order #${shortId} is in the kitchen queue! Our bakers are reviewing oven capacity.\n\nTrack order: ${ordersPageUrl}`,
    confirmed: `Hi ${input.name ?? "there"},\n\nGreat news! Your Sweet Crumb bakery order #${shortId} has been confirmed by the head baker. Our team will prepare your bakes hot & fresh for your scheduled slot.\n\nYou can track your order status anytime at:\n👉 ${ordersPageUrl}\n\nThank you for choosing Sweet Crumb!`,
    completed: `Hi ${input.name ?? "there"},\n\nYour Sweet Crumb order #${shortId} has been fulfilled! We hope you love your fresh bakes.\n\nSweet Crumb Bakery`,
    rejected: `Hi ${input.name ?? "there"},\n\nSorry, we are unable to accept order #${shortId} due to kitchen capacity constraints. Your full refund of ${formatINR(input.total)} has been initiated.\n\nSweet Crumb Bakery`,
  };

  const body = messages[input.status];
  if (!body) return;

  const subjects: Record<string, string> = {
    pending_approval: `Order #${shortId} Received — Sweet Crumb Bakery`,
    confirmed: `Order #${shortId} Confirmed by Baker — Sweet Crumb Bakery`,
    completed: `Order #${shortId} Fulfilled — Sweet Crumb Bakery`,
    rejected: `Order #${shortId} Update & Refund — Sweet Crumb Bakery`,
  };

  // 1. Send automated WhatsApp message & SMS in background
  if (input.phone) {
    await sendWhatsAppMessage(input.phone, body);
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