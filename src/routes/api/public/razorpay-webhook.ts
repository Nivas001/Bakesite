import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("[razorpay webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
          return new Response("Not configured", { status: 503 });
        }

        const signature = request.headers.get("x-razorpay-signature");
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const provided = Buffer.from(signature ?? "", "utf8");
        const digest = Buffer.from(expected, "utf8");
        if (provided.length !== digest.length || !timingSafeEqual(provided, digest)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(body) as {
          event?: string;
          payload?: {
            payment_link?: {
              entity?: { reference_id?: string; id?: string; amount_paid?: number };
            };
            payment?: {
              entity?: { id?: string; amount?: number; notes?: { order_id?: string } };
            };
          };
        };

        const orderId =
          payload.payload?.payment_link?.entity?.reference_id ??
          payload.payload?.payment?.entity?.notes?.order_id ??
          null;

        const paidEvents = new Set(["payment_link.paid", "payment.captured", "order.paid"]);
        if (!orderId || !payload.event || !paidEvents.has(payload.event)) {
          return new Response("ok");
        }

        const { COLLECTIONS, getDoc, updateDoc } =
          await import("@/integrations/appwrite/admin.server");

        const order = await getDoc<{ status: string; total: number; paid_at: string | null }>(
          COLLECTIONS.orders,
          orderId,
        );
        if (!order) {
          console.warn("[razorpay webhook] no such order:", orderId);
          return new Response("ok");
        }

        // Idempotency: Razorpay retries, and a replayed body carries a valid
        // signature. An order that is already paid must not be re-confirmed —
        // that would resurrect one the customer or admin has since cancelled.
        if (order.paid_at) return new Response("ok");
        if (order.status === "rejected" || order.status === "completed") {
          console.warn(`[razorpay webhook] ignoring payment for ${order.status} order ${orderId}`);
          return new Response("ok");
        }

        // Confirm only when the money actually covers the order. Razorpay
        // reports paise, so compare in paise.
        const paidPaise =
          payload.payload?.payment?.entity?.amount ??
          payload.payload?.payment_link?.entity?.amount_paid ??
          null;
        const expectedPaise = Math.round(Number(order.total) * 100);
        if (paidPaise !== null && paidPaise < expectedPaise) {
          console.error(
            `[razorpay webhook] underpaid order ${orderId}: got ${paidPaise}, expected ${expectedPaise}`,
          );
          return new Response("ok");
        }

        try {
          await updateDoc(COLLECTIONS.orders, orderId, {
            status: "confirmed",
            paid_at: new Date().toISOString(),
            payment_ref:
              payload.payload?.payment?.entity?.id ??
              payload.payload?.payment_link?.entity?.id ??
              null,
          });
        } catch (error) {
          console.error("[razorpay webhook] order update failed:", error);
          return new Response("Update failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
