import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { finalPrice, type CatalogProduct } from "@/lib/pricing";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { getMyOrders, cancelRescheduledOrder } from "@/lib/orders.functions";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricing";
import { formatSlotDate, slotLabelFor } from "@/lib/slots";
import { OrderSupportDialog } from "@/components/order-support-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChefHat,
  Clock,
  PackageCheck,
  XCircle,
  Sparkles,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCw,
  Flame,
  Calendar,
  CreditCard,
  HelpCircle,
  AlertCircle,
  ShieldAlert,
  Loader2,
  PackageX,
} from "lucide-react";
import { LazyVideo } from "@/components/motion/lazy-video";

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
      { title: "Your orders — Aniii Bakes Bakery" },
      {
        name: "description",
        content: "Track live status and reorder fresh morning bakes from Aniii Bakes.",
      },
      { property: "og:title", content: "Your orders — Aniii Bakes Bakery" },
      {
        property: "og:description",
        content: "Track live status and reorder fresh morning bakes from Aniii Bakes.",
      },
    ],
  }),
  component: () => (
    <RequireAuth title="Your orders">
      <OrdersPage />
    </RequireAuth>
  ),
});

export type StatusTheme = {
  label: string;
  badgeClass: string;
  cardBg: string;
  cardBorder: string;
  headerText: string;
  subText: string;
  iconBoxBg: string;
  iconColor: string;
  innerBoxBg: string;
  innerBoxBorder: string;
  itemText: string;
  tagBg: string;
  tagText: string;
  priceText: string;
  icon: typeof ChefHat;
  desc: string;
  step: number;
};

const STATUS_CONFIG: Record<string, StatusTheme> = {
  pending_approval: {
    label: "Requested · Awaiting confirmation",
    badgeClass: "bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/35",
    cardBg: "bg-[#FFFDF7] dark:bg-[#231A0B]",
    cardBorder: "border-amber-200/80 dark:border-amber-900/50",
    headerText: "text-[#4D3305] dark:text-amber-100",
    subText: "text-[#85601E] dark:text-amber-300",
    iconBoxBg: "bg-amber-100 dark:bg-amber-950/80",
    iconColor: "text-amber-700 dark:text-amber-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-amber-200/60 dark:border-amber-900/40",
    itemText: "text-[#4D3305] dark:text-amber-100",
    tagBg: "bg-amber-100 dark:bg-amber-950/80",
    tagText: "text-amber-800 dark:text-amber-300",
    priceText: "text-[#4D3305] dark:text-amber-100",
    icon: ChefHat,
    desc: "We have your request. The head baker is checking the morning oven has room — nothing has been charged yet.",
    step: 1,
  },
  awaiting_payment: {
    label: "Approved · Pay Now",
    badgeClass: "bg-blue-500/20 text-blue-950 dark:text-blue-200 border border-blue-500/35",
    cardBg: "bg-[#F5F9FF] dark:bg-[#0B1C30]",
    cardBorder: "border-blue-200/80 dark:border-blue-900/50",
    headerText: "text-[#0D2E5C] dark:text-blue-100",
    subText: "text-[#28578F] dark:text-blue-300",
    iconBoxBg: "bg-blue-100 dark:bg-blue-950/80",
    iconColor: "text-blue-700 dark:text-blue-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-blue-200/60 dark:border-blue-900/40",
    itemText: "text-[#0D2E5C] dark:text-blue-100",
    tagBg: "bg-blue-100 dark:bg-blue-950/80",
    tagText: "text-blue-800 dark:text-blue-300",
    priceText: "text-[#0D2E5C] dark:text-blue-100",
    icon: Clock,
    desc: "Your slot has been approved! Complete payment to lock in your morning bake.",
    step: 1,
  },
  confirmed: {
    label: "Confirmed by Baker",
    badgeClass:
      "bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border border-emerald-500/35",
    cardBg: "bg-[#F5FAF7] dark:bg-[#0A2216]",
    cardBorder: "border-emerald-200/80 dark:border-emerald-900/50",
    headerText: "text-[#0E3E26] dark:text-emerald-100",
    subText: "text-[#246744] dark:text-emerald-300",
    iconBoxBg: "bg-emerald-100 dark:bg-emerald-950/80",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-emerald-200/60 dark:border-emerald-900/40",
    itemText: "text-[#0E3E26] dark:text-emerald-100",
    tagBg: "bg-emerald-100 dark:bg-emerald-950/80",
    tagText: "text-emerald-800 dark:text-emerald-300",
    priceText: "text-[#0E3E26] dark:text-emerald-100",
    icon: Flame,
    desc: "Slot secured! Dough is cold-fermenting for fresh dawn baking at 4:00 AM.",
    step: 2,
  },
  rescheduled: {
    label: "Slot Rescheduled",
    badgeClass: "bg-purple-500/20 text-purple-950 dark:text-purple-200 border border-purple-500/35",
    cardBg: "bg-[#FAF6FF] dark:bg-[#1E0F33]",
    cardBorder: "border-purple-200/80 dark:border-purple-900/50",
    headerText: "text-[#3B1564] dark:text-purple-100",
    subText: "text-[#6F3A9F] dark:text-purple-300",
    iconBoxBg: "bg-purple-100 dark:bg-purple-950/80",
    iconColor: "text-purple-700 dark:text-purple-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-purple-200/60 dark:border-purple-900/40",
    itemText: "text-[#3B1564] dark:text-purple-100",
    tagBg: "bg-purple-100 dark:bg-purple-950/80",
    tagText: "text-purple-800 dark:text-purple-300",
    priceText: "text-[#3B1564] dark:text-purple-100",
    icon: Clock,
    desc: "The head baker adjusted your delivery window to guarantee peak oven freshness.",
    step: 2,
  },
  completed: {
    label: "Fulfilled / Delivered",
    badgeClass: "bg-rose-500/20 text-rose-950 dark:text-rose-200 border border-rose-500/35",
    cardBg: "bg-[#FFF5F6] dark:bg-[#251015]",
    cardBorder: "border-rose-200/80 dark:border-rose-900/50",
    headerText: "text-[#4A101A] dark:text-rose-100",
    subText: "text-[#87414E] dark:text-rose-300",
    iconBoxBg: "bg-rose-100 dark:bg-rose-950/80",
    iconColor: "text-rose-700 dark:text-rose-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-rose-200/60 dark:border-rose-900/40",
    itemText: "text-[#4A101A] dark:text-rose-100",
    tagBg: "bg-rose-100 dark:bg-rose-950/80",
    tagText: "text-rose-800 dark:text-rose-300",
    priceText: "text-[#4A101A] dark:text-rose-100",
    icon: PackageCheck,
    desc: "Baked fresh and delivered to your doorstep. Hope you loved every bite!",
    step: 3,
  },
  rejected: {
    label: "Cancelled & Refunded",
    badgeClass: "bg-destructive/15 text-destructive border border-destructive/30",
    cardBg: "bg-[#F8F9FA] dark:bg-[#191D22]",
    cardBorder: "border-slate-200 dark:border-slate-800",
    headerText: "text-slate-800 dark:text-slate-200",
    subText: "text-slate-500 dark:text-slate-400",
    iconBoxBg: "bg-slate-200 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    innerBoxBg: "bg-white/80 dark:bg-black/25",
    innerBoxBorder: "border-slate-200/60 dark:border-slate-800",
    itemText: "text-slate-800 dark:text-slate-200",
    tagBg: "bg-slate-200 dark:bg-slate-800",
    tagText: "text-slate-700 dark:text-slate-300",
    priceText: "text-slate-800 dark:text-slate-200",
    icon: XCircle,
    desc: "Slot cancelled. If a payment was taken, a full refund has been initiated.",
    step: 0,
  },
};

/** The stages a normal order passes through, in order. */
const ORDER_STAGES = [
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Slot confirmed" },
  { key: "paid", label: "Paid" },
  { key: "baked", label: "Baked & delivered" },
] as const;

/** How far along `status` is, as an index into ORDER_STAGES. -1 means cancelled. */
function stageIndexFor(status: string): number {
  switch (status) {
    case "pending_approval":
      return 0;
    case "awaiting_payment":
    case "rescheduled":
      return 1;
    case "confirmed":
      return 2;
    case "completed":
    case "delivered":
      return 3;
    default:
      return -1;
  }
}

/**
 * Horizontal progress through the order stages.
 *
 * The status badge says where an order is; this says what is still to come,
 * which is the question customers actually have while they wait.
 */
function OrderTimeline({ status }: { status: string }) {
  const current = stageIndexFor(status);

  if (current < 0) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2 text-[11px] font-semibold text-destructive">
        This order was cancelled and is no longer in the bake queue.
      </p>
    );
  }

  return (
    <ol className="flex items-center gap-1" aria-label="Order progress">
      {ORDER_STAGES.map((stage, index) => {
        const done = index <= current;
        return (
          <li key={stage.key} className="flex-1">
            <span
              className={`block h-1 rounded-full ${done ? "bg-emerald-600" : "bg-black/10 dark:bg-white/15"}`}
            />
            <span
              className={`mt-1 block truncate text-[10px] font-bold ${
                index === current
                  ? "text-emerald-800 dark:text-emerald-300"
                  : done
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
              }`}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCardItem({
  order,
  onReportIssue,
  catalogProducts,
}: {
  order: OrderRecord;
  onReportIssue: (order: OrderRecord) => void;
  /** Live catalogue, used to rebuild a basket at today's prices. */
  catalogProducts: CatalogProduct[] | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("New delivery time does not suit my schedule");
  const [isRejecting, setIsRejecting] = useState(false);

  const { add } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cancelRescheduledFn = useServerFn(cancelRescheduledOrder);

  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending_approval"]!;
  const StatusIcon = config.icon;

  const totalItemsCount = order.order_items.reduce((s, i) => s + i.quantity, 0);
  const items = order.order_items;
  const isMultiItem = items.length > 3;
  const displayedItems = isMultiItem && !expanded ? items.slice(0, 2) : items;

  /**
   * Rebuilds the basket from a past order.
   *
   * Matched against the live catalogue rather than copied from the order rows:
   * the stored rows carry only a name and the price paid at the time, so a
   * slug guessed from the name pointed at a product page that did not exist,
   * the thumbnail was always missing, and the old price was reused. Quantities
   * were dropped too, because `add` was called once per line without one.
   */
  function handleReorder() {
    const catalogue = catalogProducts ?? [];
    let added = 0;
    let unavailable = 0;

    for (const item of order.order_items) {
      if (!item.product_id) continue;
      const product = catalogue.find((p) => p.id === item.product_id);
      if (!product) {
        unavailable += 1;
        continue;
      }
      const unitPrice = finalPrice(product.price, product.discount_type, product.discount_value);
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          unitPrice,
          basePrice: product.price,
          imageUrl: product.image_url,
        },
        item.quantity,
      );
      added += item.quantity;
    }

    if (added === 0) {
      toast.error("None of these bakes are on the counter right now.");
      return;
    }
    toast.success(
      unavailable > 0
        ? `Added ${added} items. ${unavailable} are no longer on the counter.`
        : `Added ${added} items to your cart at today's prices.`,
    );
    navigate({ to: "/cart" });
  }

  async function handleConfirmRejectRescheduled() {
    try {
      setIsRejecting(true);
      const res = await cancelRescheduledFn({
        data: {
          orderId: order.id,
          reason: rejectReason,
        },
      });
      toast.success(res.message);
      setRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  }

  const isFulfilled = order.status === "completed" || order.status === "delivered";
  const isCancelled = order.status === "rejected";
  const isRescheduled = order.status === "rescheduled";

  return (
    <>
      <li
        className={`rounded-3xl border ${config.cardBorder} ${config.cardBg} p-4 sm:p-6 shadow-soft transition-all duration-300 hover:shadow-lift flex flex-col justify-between overflow-hidden relative group`}
      >
        {/* 1. Header Row: Date & Status */}
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${config.iconBoxBg} ${config.iconColor} shadow-2xs border border-black/5`}
              >
                <StatusIcon className="size-5" />
              </div>
              <div className="min-w-0">
                {/* Date Display in INTER font */}
                <div className="flex items-center gap-1.5">
                  <Calendar className={`size-3.5 shrink-0 ${config.iconColor}`} />
                  <p
                    className={`font-sans font-bold text-sm sm:text-base tracking-tight truncate ${config.headerText}`}
                  >
                    {formatSlotDate(order.slot_date)}
                  </p>
                </div>
                <p className={`text-xs font-medium truncate mt-0.5 ${config.subText}`}>
                  {slotLabelFor(order.slot_start)} ·{" "}
                  <span className="capitalize font-semibold">{order.fulfilment_type}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${config.badgeClass}`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isFulfilled
                      ? "bg-rose-600 dark:bg-rose-400"
                      : isCancelled
                        ? "bg-destructive"
                        : "bg-emerald-500 animate-pulse"
                  }`}
                />
                {config.label}
              </span>
              <span
                className={`text-[11px] font-mono font-bold tracking-wider opacity-75 ${config.subText}`}
              >
                #{order.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
          <OrderTimeline status={order.status} />

          {/* 2. Rescheduled Order Action Alert Box */}
          {isRescheduled && (
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                <Clock className="size-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs">Baker Rescheduled Your Delivery Slot</span>
              </div>
              <p className="text-xs text-purple-900/80 dark:text-purple-300/90 leading-relaxed">
                Your delivery was adjusted to{" "}
                <strong>
                  {formatSlotDate(order.slot_date)} ({slotLabelFor(order.slot_start)})
                </strong>
                . If this time does not work for you, you can reject the slot for an immediate full
                refund.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setRejectModalOpen(true)}
                  className="rounded-xl text-xs font-bold h-8 px-3 shadow-2xs cursor-pointer"
                >
                  <PackageX className="size-3.5 mr-1" />
                  <span>Reject & Cancel Order</span>
                </Button>
              </div>
            </div>
          )}

          {/* 3. What is happening right now, in words.
              The three-segment bar that used to sit here said the same thing as
              the timeline directly above it, in a different scale — two
              progress meters for one order. Only the sentence survives. */}
          {!isCancelled && !isRescheduled && (
            <div
              className={`rounded-2xl ${config.innerBoxBg} p-3 border ${config.innerBoxBorder} flex items-start gap-2.5`}
            >
              <Flame className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              <p className={`text-xs leading-relaxed font-medium ${config.subText}`}>
                {config.desc}
              </p>
            </div>
          )}

          {/* 4. Bake Items List in INTER font with Matching Card Theme */}
          <div
            className={`rounded-2xl ${config.innerBoxBg} p-3 border ${config.innerBoxBorder} space-y-2`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1.5 ${config.subText}`}
            >
              <span>Bake Items ({totalItemsCount})</span>
              {isMultiItem && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className={`flex items-center gap-1 font-bold text-xs lowercase transition-colors cursor-pointer ${config.iconColor}`}
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="size-3.5" />
                    </>
                  ) : (
                    <>
                      +{items.length - 2} more <ChevronDown className="size-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            <ul className="space-y-1.5 text-xs">
              {displayedItems.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md ${config.tagBg} ${config.tagText} font-sans font-bold text-[11px]`}
                    >
                      {item.quantity}×
                    </span>
                    {/* Bake Item Product Name in INTER font */}
                    <span className={`font-sans font-semibold text-xs truncate ${config.itemText}`}>
                      {item.product_name}
                    </span>
                  </div>
                  <span
                    className={`font-sans font-bold shrink-0 text-xs tabular-nums ${config.subText}`}
                  >
                    {formatCurrency(Number(item.line_total))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Footer: Recipient Contact & Total Paid / Actions */}
        <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/5 space-y-3">
          {/* Recipient & Address Row */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${config.subText}`}
          >
            <div className="space-y-1 min-w-0">
              <p
                className={`flex items-center gap-1.5 truncate font-semibold ${config.headerText}`}
              >
                <Phone className={`size-3.5 shrink-0 ${config.iconColor}`} />
                <span className="truncate">
                  {order.contact_phone} ({order.contact_name})
                </span>
              </p>
              {order.delivery_address && (
                <p className={`flex items-center gap-1.5 truncate text-[11px] ${config.subText}`}>
                  <MapPin className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{order.delivery_address}</span>
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className={`text-[10px] uppercase font-bold tracking-wider ${config.subText}`}>
                {order.status === "awaiting_payment" ? "Total Due" : "Total Paid"}
              </p>
              <p
                className={`font-sans text-xl sm:text-2xl font-black tracking-tight tabular-nums ${config.priceText}`}
              >
                {formatCurrency(Number(order.total))}
              </p>
            </div>
          </div>

          {/* Action 1: Completed Orders -> Report Issue + Re-order Buttons */}
          {isFulfilled && (
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onReportIssue(order)}
                className={`inline-flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer hover:opacity-80 ${config.iconColor}`}
              >
                <AlertCircle className="size-3.5" />
                <span>Report an Issue</span>
              </button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReorder}
                className="rounded-full border-rose-300 dark:border-rose-800 bg-white/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 hover:bg-rose-100 font-bold text-xs h-8.5 px-3.5 shadow-2xs cursor-pointer ml-auto"
              >
                <RotateCw className="size-3.5 mr-1 text-rose-600 dark:text-rose-400" />
                <span>Re-order Batch</span>
              </Button>
            </div>
          )}

          {/* Action 2: Complete Payment Button (For Awaiting Payment) */}
          {order.status === "awaiting_payment" && order.payment_link_url && (
            <div className="pt-2 border-t border-black/5 dark:border-white/5">
              <Button
                asChild
                className="w-full rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-10 shadow-lift cursor-pointer"
              >
                <a
                  href={order.payment_link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="size-4 text-amber-300" />
                  <span>Complete Payment to Secure Slot →</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </li>

      {/* Reject / Cancel Rescheduled Order Confirmation Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-border/80 bg-card shadow-lift">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" />
              <DialogTitle className="font-blogh uppercase tracking-wide text-lg text-cocoa">
                Reject Rescheduled Slot
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1 font-sans">
              Cancelling order #{order.id.slice(-6).toUpperCase()} will release the baking slot and
              initiate a 100% full refund to your original payment method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs font-sans">
            <label className="font-bold text-foreground block">
              Reason for rejecting rescheduled time:
            </label>
            <div className="space-y-1.5">
              {[
                "New delivery time does not suit my schedule",
                "Needed for a specific event that has passed",
                "Cannot receive package at new time",
                "Other reason",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full rounded-xl border p-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                    rejectReason === reason
                      ? "border-destructive bg-destructive/10 text-destructive font-bold shadow-2xs"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-3 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              className="rounded-xl text-xs flex-1"
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isRejecting}
              onClick={handleConfirmRejectRescheduled}
              className="rounded-xl text-xs font-bold flex-1"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                  <span>Cancelling…</span>
                </>
              ) : (
                <span>Confirm Rejection & Refund</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });
  // Re-ordering rebuilds the basket from live products, not from the stored
  // order rows, so prices and availability are current.
  const { data: catalog } = useQuery({ queryKey: ["catalog"], queryFn: () => getCatalog() });
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedSupportOrder, setSelectedSupportOrder] = useState<OrderRecord | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-berry border-t-transparent" />
        <p className="text-sm font-medium">Fetching your fresh bakery orders…</p>
      </div>
    );
  }

  const orders = (data as unknown as OrderRecord[]) ?? [];

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return (
        order.status !== "completed" && order.status !== "delivered" && order.status !== "rejected"
      );
    }
    if (filter === "completed") {
      return order.status === "completed" || order.status === "delivered";
    }
    return true;
  });

  const activeCount = orders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered" && o.status !== "rejected",
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === "completed" || o.status === "delivered",
  ).length;

  /**
   * Money actually taken. `paid_at` is the source of truth; the statuses below
   * are only reached after the payment link is settled, so they cover rows
   * written before the timestamp existed.
   */
  const lifetimeSpend = orders
    .filter(
      (o) =>
        o.paid_at ||
        o.status === "confirmed" ||
        o.status === "rescheduled" ||
        o.status === "completed" ||
        o.status === "delivered",
    )
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  function handleOpenSupport(order?: OrderRecord) {
    setSelectedSupportOrder(order ?? null);
    setSupportModalOpen(true);
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20 text-center">
        <div className="relative mx-auto flex size-44 sm:size-56 md:size-64 items-center justify-center mb-6">
          <LazyVideo
            src="/illustration/3d-stickle-ai-analytics-report-on-clipboard"
            className="size-full object-contain pointer-events-none drop-shadow-xl"
          />
        </div>
        <h1 className="font-blogh uppercase tracking-wide text-3xl sm:text-5xl font-bold text-cocoa">
          No Orders Yet
        </h1>
        <p className="mt-3 text-xs sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your morning slot is waiting. Explore our stone-hearth wild sourdoughs, French butter
          croissants, and custom celebration cakes.
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-cocoa text-background hover:bg-cocoa/90 px-8 py-5 font-bold text-sm shadow-lift cursor-pointer"
        >
          <Link to="/shop" className="flex items-center gap-2">
            <span>Browse Daily Counter Bakes</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Page header — the three numbers a customer opens this page for sit
          beside the title instead of being buried in the filter labels. */}
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 p-5 shadow-soft sm:rounded-4xl sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-60 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase sm:text-xs dark:text-amber-300">
              <Sparkles className="size-3.5" />
              <span>Live order tracking</span>
            </span>
            <h1 className="mt-1.5 font-blogh text-3xl leading-tight font-bold tracking-wide text-cocoa uppercase sm:text-4xl lg:text-5xl">
              Your orders
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Handcrafted in small batches every dawn from 4:00 AM.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <dl className="grid grid-cols-3 gap-2 lg:w-80">
              {[
                { label: "In the queue", value: String(activeCount) },
                { label: "Delivered", value: String(completedCount) },
                { label: "Spent with us", value: formatCurrency(lifetimeSpend) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-2.5 text-center shadow-2xs"
                >
                  <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 font-blogh text-base font-bold text-cocoa tabular-nums sm:text-lg">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenSupport()}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-cocoa/30 bg-card px-4 text-xs font-bold text-cocoa shadow-2xs hover:bg-cocoa/10 lg:w-fit"
            >
              <HelpCircle className="size-4 text-berry-deep" />
              <span>Help &amp; Support</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-secondary/50 p-1">
          {(
            [
              { id: "all", label: "All orders", count: orders.length },
              { id: "active", label: "In the queue", count: activeCount },
              { id: "completed", label: "Delivered", count: completedCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              aria-pressed={filter === tab.id}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? "bg-cocoa text-background shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  filter === tab.id ? "bg-white/20" : "bg-card text-cocoa"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid (1 Col Mobile, 2 Cols Tablet & Desktop) */}
      {filteredOrders.length === 0 ? (
        <div className="space-y-3 rounded-3xl border-2 border-dashed border-border/70 bg-card/60 p-10 text-center font-sans">
          <span className="text-4xl">📭</span>
          <p className="text-base font-bold text-foreground">
            {filter === "active"
              ? "Nothing in the bake queue right now."
              : "No delivered orders yet."}
          </p>
          <p className="text-xs text-muted-foreground">
            Switch to All orders to see your complete history.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-full mt-2"
          >
            Show All Orders
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => (
            <OrderCardItem
              key={order.id}
              order={order}
              onReportIssue={handleOpenSupport}
              catalogProducts={catalog?.products}
            />
          ))}
        </ul>
      )}

      {/* Interactive Help & Support Modal */}
      <OrderSupportDialog
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        selectedOrder={selectedSupportOrder}
        orders={orders}
      />
    </div>
  );
}

export default OrdersPage;
