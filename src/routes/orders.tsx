import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

export type OrderRecord = {
  id: string;
  status: string;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  total: number;
  subtotal: number;
  discount_total: number;
  fulfilment_type: string;
  contact_name: string | null;
  contact_phone: string | null;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  notes: string | null;
  payment_link_url: string | null;
  paid_at: string | null;
  created_at: string;
  order_items: Array<{
    product_id: string | null;
    product_name: string;
    quantity: number;
    line_total: number;
  }>;
};

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
    label: "Paid · In Queue",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",
    icon: ChefHat,
    desc: "Payment received! The head baker is scheduling your bakes for this morning slot.",
  },
  awaiting_payment: {
    label: "Approved · Pay Now",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30",
    icon: Clock,
    desc: "Your slot has been approved! Complete payment to secure your bakes.",
  },
  confirmed: {
    label: "Confirmed by Baker",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
    icon: CheckCircle2,
    desc: "Baking slot confirmed! Our kitchen is preparing to bake fresh for your slot.",
  },
  rescheduled: {
    label: "Slot Rescheduled",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30",
    icon: Clock,
    desc: "The head baker has adjusted your slot schedule to ensure optimal freshness.",
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
    desc: "Slot was unavailable. Your full refund has been initiated.",
  },
};

function OrderCardItem({ order }: { order: OrderRecord }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending_approval"]!;
  const StatusIcon = config.icon;

  const totalItemsCount = order.order_items.reduce((s, i) => s + i.quantity, 0);
  const items = order.order_items;
  const isMultiItem = items.length > 3;
  const displayedItems = isMultiItem && !expanded ? items.slice(0, 2) : items;

  return (
    <li className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-soft transition-all overflow-hidden flex flex-col justify-between">
      
      {/* 1. Header Row: Date & Status Pill */}
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-berry shadow-2xs">
              <StatusIcon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-xs sm:text-sm text-foreground truncate">
                {formatSlotDate(order.slot_date)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {slotLabelFor(order.slot_start)}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {order.fulfilment_type === "delivery" ? "🚚 Delivery" : "🛍️ Pickup"} · #{order.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold shrink-0 ${config.badgeClass}`}
          >
            <StatusIcon className="size-3" />
            <span>{config.label}</span>
          </span>
        </div>

        {/* 2. Compact Baker Kitchen Notification Callout */}
        <div className="mt-3 rounded-xl bg-secondary/35 p-2.5 border border-border/40 flex items-start gap-2">
          <Sparkles className="size-3.5 shrink-0 text-berry mt-0.5" />
          <div className="text-[11px] text-muted-foreground leading-tight space-y-1 min-w-0">
            <p className="text-foreground font-medium">{config.desc}</p>
            {order.notes && order.notes.includes("Baker Note:") && (
              <p className="text-purple-700 dark:text-purple-300 font-semibold">
                {order.notes.slice(order.notes.indexOf("Baker Note:"))}
              </p>
            )}
          </div>
        </div>

        {/* 3. High-Density Ordered Items List */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Bake Box ({totalItemsCount} {totalItemsCount === 1 ? "bake" : "bakes"})</span>
            {isMultiItem && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-berry normal-case font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {expanded ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    <span>+{items.length - 2} more bakes</span>
                    <ChevronDown className="size-3" />
                  </>
                )}
              </button>
            )}
          </div>

          <ul className="space-y-1 text-xs text-foreground/90">
            {displayedItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-0.5">
                <span className="font-medium truncate pr-2">
                  <span className="font-bold text-berry mr-1.5">{item.quantity}×</span>
                  {item.product_name}
                </span>
                <span className="font-semibold text-muted-foreground shrink-0 text-[11px]">
                  {formatCurrency(Number(item.line_total))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Footer: Recipient Info & Bold Total Paid */}
      <div className="mt-3.5 border-t border-border/60 pt-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground min-w-0 pr-2">
          <p className="flex items-center gap-1 truncate font-medium text-foreground">
            <Phone className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{order.contact_phone} ({order.contact_name})</span>
          </p>
          {order.delivery_address && (
            <p className="flex items-center gap-1 truncate mt-0.5 text-muted-foreground">
              <MapPin className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{order.delivery_address}</span>
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {order.status === "awaiting_payment" ? "Total Due" : "Total Paid"}
          </p>
          <p className="font-sans text-base sm:text-lg font-black text-cocoa tracking-tight">
            {formatCurrency(Number(order.total))}
          </p>
        </div>
      </div>

      {/* Awaiting Payment Action Button */}
      {order.status === "awaiting_payment" && order.payment_link_url && (
        <div className="mt-3 pt-2 border-t border-border/60">
          <Button asChild className="w-full rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs h-9 shadow-soft">
            <a href={order.payment_link_url} target="_blank" rel="noreferrer">
              Complete Payment Now →
            </a>
          </Button>
        </div>
      )}

    </li>
  );
}

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-berry border-t-transparent" />
        <p className="text-xs sm:text-sm font-medium">Loading your orders…</p>
      </div>
    );
  }

  const orders = (data as unknown as OrderRecord[]) ?? [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-secondary/80 text-berry mb-4 shadow-soft">
          <ChefHat className="size-8" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-cocoa">No orders yet</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Explore our artisan sourdoughs, flaky croissants, and treats baked fresh for your chosen slot.
        </p>
        <Button asChild className="mt-6 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 px-6 py-5 font-semibold text-xs sm:text-sm shadow-soft">
          <Link to="/shop">Browse the Bakery Counter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      
      {/* Header: Clean & Compact */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-berry/10 border border-berry/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-berry">
              <Sparkles className="size-3" /> Live Kitchen Tracker
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({orders.length} {orders.length === 1 ? "order" : "orders"})
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-cocoa leading-tight">
            Your orders
          </h1>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold text-xs h-8 px-3 border-border bg-card/80">
          <Link to="/shop" className="flex items-center gap-1">
            <span>Order more</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>

      {/* Order Cards Grid: 1 Col on Mobile (< 640px), 2 Cols on Tablet & Desktop (sm: at 640px+) */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orders.map((order) => (
          <OrderCardItem key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}