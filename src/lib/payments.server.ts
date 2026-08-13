const RAZORPAY_API = "https://api.razorpay.com/v1";

function razorpayAuth(): string | null {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export function razorpayConfigured(): boolean {
  return razorpayAuth() !== null;
}

/**
 * Creates a Razorpay payment link for an approved order.
 * Returns null (and logs) when Razorpay keys aren't configured yet.
 */
export async function createPaymentLink(input: {
  orderId: string;
  amount: number;
  name: string | null;
  phone: string | null;
  email?: string | null;
}): Promise<{ url: string; reference: string } | null> {
  const auth = razorpayAuth();
  if (!auth) {
    console.info("[razorpay] keys not configured — skipping payment link", input.orderId);
    return null;
  }

  const response = await fetch(`${RAZORPAY_API}/payment_links`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: "INR",
      accept_partial: false,
      description: `Sweet Crumb order ${input.orderId.slice(0, 8)}`,
      reference_id: input.orderId,
      customer: {
        name: input.name ?? undefined,
        contact: input.phone ?? undefined,
        email: input.email ?? undefined,
      },
      notify: { sms: false, email: false },
      reminder_enable: true,
      notes: { order_id: input.orderId },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[razorpay] payment link failed [${response.status}]: ${body}`);
    throw new Error(`Payment link could not be created [${response.status}]: ${body}`);
  }

  const data = (await response.json()) as { short_url: string; id: string };
  return { url: data.short_url, reference: data.id };
}