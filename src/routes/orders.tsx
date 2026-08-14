import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyOrders } from "@/lib/orders.functions";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricing";
import { formatSlotDate, slotLabelFor } from "@/lib/slots";
import {
  ChefHat,
  CheckCircle2,
  Clock,
  PackageCheck,
  XCircle,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — Ani Bakes Bakery" },
      { name: "description", content: "Track the live status of your Ani Bakes bakery orders." },
      { property: "og:title", content: "Your orders — Ani Bakes Bakery" },
      { property: "og:description", content: "Track the live status of your bakery orders." },
    ],
  }),
  component: () => (
    <RequireAuth title="Your orders">
      <OrdersPage />
    </RequireAuth>
  ),
});

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: typeof ChefHat; desc: string }
> = {
  pending_approval: {
    label: "Paid · In Kitchen Queue",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",
    icon: ChefHat,
    desc: "Payment received! The head baker is reviewing the oven schedule and preparation capacity for your selected slot.",
  },
  awaiting_payment: {
    label: "Slot Approved · Awaiting Payment",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30",
    icon: Clock,
    desc: "Your slot has been approved. Please complete payment to confirm your bakes.",
  },
  confirmed: {
    label: "Confirmed by Baker",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
    icon: CheckCircle2,
    desc: "Your baking slot is confirmed! Our kitchen is preparing to bake fresh for your arrival window.",
  },
  rescheduled: {
    label: "Baking Slot Rescheduled",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30",
    icon: Clock,
    desc: "The head baker has adjusted your slot schedule to ensure perfect freshness.",
  },
  completed: {
    label: "Fulfilled / Delivered",
    badgeClass: "bg-secondary text-secondary-foreground border border-border",
    icon: PackageCheck,
    desc: "Your fresh bakes have been prepared and fulfilled. Enjoy!",
  },
  rejected: {
    label: "Cancelled & Refunded",
    badgeClass: "bg-destructive/15 text-destructive border border-destructive/30",
    icon: XCircle,
    desc: "Unfortunately this slot was unavailable. Your full refund has been initiated.",
  },
};

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-berry border-t-transparent" />
        <p className="text-sm font-medium">Loading your orders…</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary/80 text-berry mb-4">
          <ChefHat className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-cocoa">No orders yet</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Explore our artisan sourdoughs, flaky croissants, and treats baked fresh for your chosen slot.
        </p>
        <Button asChild className="mt-8 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 px-8 py-6 font-semibold">
          <Link to="/shop">Browse the bakery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cocoa">Your orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live kitchen preparation and baking schedule status
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold text-xs">
          <Link to="/shop">Order more</Link>
        </Button>
      </div>

      <ul className="mt-8 space-y-6">
        {data.map((order) => {
          const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending_approval"]!;
          const StatusIcon = config.icon;

          return (
            <li
              key={order.id}
              className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition-all overflow-hidden"
            >
              {/* Order Top Bar: Date & Status Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-berry">
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-bold text-sm text-foreground">
                        {formatSlotDate(order.slot_date)}
                      </p>
                      <span className="text-xs text-muted-foreground">·</span>
                      <p className="font-sans text-xs font-semibold text-muted-foreground">
                        {slotLabelFor(order.slot_start)} ({order.slot_start.slice(0, 5)}–{order.slot_end.slice(0, 5)})
                      </p>
                    </div>
                    <p className="text-[11px] capitalize text-muted-foreground mt-0.5">
                      {order.fulfilment_type === "delivery" ? "🚚 Home Delivery" : "🛍️ Bakery Pickup"} · Order #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.badgeClass}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span>{config.label}</span>
                </span>
              </div>

              {/* Status Explanation Card */}
              <div className="mt-4 rounded-2xl bg-secondary/30 p-3.5 border border-border/40 flex items-start gap-3">
                <Sparkles className="h-4 w-4 shrink-0 text-berry mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium leading-relaxed">{config.desc}</p>
                  {order.notes && order.notes.includes("Baker Note:") && (
                    <p className="text-purple-700 dark:text-purple-300 font-semibold pt-1">
                      {order.notes.slice(order.notes.indexOf("Baker Note:"))}
                    </p>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Order Items ({order.order_items.reduce((s, i) => s + i.quantity, 0)})
                </p>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {order.order_items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-0.5">
                      <span className="font-medium">
                        <span className="font-bold text-berry mr-1.5">{item.quantity}×</span>
                        {item.product_name}
                      </span>
                      <span className="font-semibold text-muted-foreground">
                        {formatCurrency(Number(item.line_total))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total and Delivery Details Footer */}
              <div className="mt-5 border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{order.contact_phone} ({order.contact_name})</span>
                  </p>
                  {order.delivery_address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="line-clamp-1">{order.delivery_address}</span>
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Total Paid</p>
                  <p className="font-sans text-xl font-extrabold text-foreground tracking-tight">
                    {formatCurrency(Number(order.total))}
                  </p>
                </div>
              </div>

              {/* Awaiting Payment fallback if payment link exists */}
              {order.status === "awaiting_payment" && order.payment_link_url && (
                <div className="mt-4 flex justify-end">
                  <Button asChild className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold text-xs">
                    <a href={order.payment_link_url} target="_blank" rel="noreferrer">
                      Complete payment
                    </a>
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}