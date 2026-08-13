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
            payment_link?: { entity?: { reference_id?: string; id?: string } };
            payment?: { entity?: { id?: string; notes?: { order_id?: string } } };
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

        const { COLLECTIONS, updateDoc } = await import("@/integrations/appwrite/admin.server");
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