import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyOrders } from "@/lib/orders.functions";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricing";
import { formatSlotDate, slotLabelFor } from "@/lib/slots";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — Sweet Crumb Bakery" },
      { name: "description", content: "Track the status of your Sweet Crumb bakery orders." },
      { property: "og:title", content: "Your orders — Sweet Crumb Bakery" },
      { property: "og:description", content: "Track the status of your bakery orders." },
    ],
  }),
  component: () => (
    <RequireAuth title="Your orders">
      <OrdersPage />
    </RequireAuth>
  ),
});

const STATUS_COPY: Record<string, string> = {
  pending_approval: "Waiting for the bakery to confirm your slot",
  awaiting_payment: "Slot approved — complete payment to confirm",
  confirmed: "Paid and in the bake queue",
  completed: "Delivered",
  rejected: "Slot unavailable",
};

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">No orders yet</h1>
        <Button asChild className="mt-8 bg-berry text-berry-foreground hover:bg-berry/90">
          <Link to="/shop">Browse the bakery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-cocoa">Your orders</h1>
      <ul className="mt-8 space-y-4">
        {data.map((order) => (
          <li key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {formatSlotDate(order.slot_date)} · {slotLabelFor(order.slot_start)}
                </p>
                <p className="text-sm capitalize text-muted-foreground">{order.fulfilment_type}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {STATUS_COPY[order.status] ?? order.status}
              </span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {order.order_items.map((item, index) => (
                <li key={index}>
                  {item.quantity} × {item.product_name}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right font-semibold">{formatCurrency(Number(order.total))}</p>
            {order.status === "awaiting_payment" && order.payment_link_url && (
              <div className="mt-4 flex justify-end">
                <Button asChild className="bg-berry text-berry-foreground hover:bg-berry/90">
                  <a href={order.payment_link_url} target="_blank" rel="noreferrer">
                    Pay now
                  </a>
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}