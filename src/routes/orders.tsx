import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  RotateCw,
  ShoppingBag,
  Flame,
  Calendar,
  CreditCard,
  HelpCircle,
  AlertCircle,
  ShieldAlert,
  Loader2,
  PackageX,
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
      { name: "description", content: "Track live status and reorder fresh morning bakes from Ani Bakes." },
      { property: "og:title", content: "Your orders — Ani Bakes Bakery" },
      { property: "og:description", content: "Track live status and reorder fresh morning bakes from Ani Bakes." },
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
    label: "Paid · In Queue",
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
    desc: "Payment confirmed! The head baker is scheduling your bakes for the morning slot.",
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
    badgeClass: "bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border border-emerald-500/35",
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
    desc: "Slot cancelled or rejected. Full refund has been initiated.",
    step: 0,
  },
};

function OrderCardItem({
  order,
  onReportIssue,
}: {
  order: OrderRecord;
  onReportIssue: (order: OrderRecord) => void;
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

  function handleReorder() {
    let addedCount = 0;
    for (const item of order.order_items) {
      if (item.product_id) {
        const unitPrice = Number(item.line_total) / Math.max(1, item.quantity);
        add({
          productId: item.product_id,
          slug: item.product_name.toLowerCase().replace(/\s+/g, "-"),
          name: item.product_name,
          unitPrice,
          basePrice: unitPrice,
          imageUrl: null,
        });
        addedCount += item.quantity;
      }
    }
    toast.success(`Added ${addedCount || "all"} items from order to your cart tray!`);
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
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${config.iconBoxBg} ${config.iconColor} shadow-2xs border border-black/5`}>
                <StatusIcon className="size-5" />
              </div>
              <div className="min-w-0">
                {/* Date Display in INTER font */}
                <div className="flex items-center gap-1.5">
                  <Calendar className={`size-3.5 shrink-0 ${config.iconColor}`} />
                  <p className={`font-sans font-bold text-sm sm:text-base tracking-tight truncate ${config.headerText}`}>
                    {formatSlotDate(order.slot_date)}
                  </p>
                </div>
                <p className={`text-xs font-medium truncate mt-0.5 ${config.subText}`}>
                  {slotLabelFor(order.slot_start)} · <span className="capitalize font-semibold">{order.fulfilment_type}</span>
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
              <span className={`text-[10px] font-mono font-bold tracking-wider opacity-75 ${config.subText}`}>
                #{order.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* 2. Rescheduled Order Action Alert Box */}
          {isRescheduled && (
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                <Clock className="size-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs">Baker Rescheduled Your Delivery Slot</span>
              </div>
              <p className="text-xs text-purple-900/80 dark:text-purple-300/90 leading-relaxed">
                Your delivery was adjusted to <strong>{formatSlotDate(order.slot_date)} ({slotLabelFor(order.slot_start)})</strong>. If this time does not work for you, you can reject the slot for an immediate full refund.
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

          {/* 3. Mini Baker Status Stepper (For Active Non-Rescheduled Orders) */}
          {!isFulfilled && !isCancelled && !isRescheduled && (
            <div className={`rounded-2xl ${config.innerBoxBg} p-3 sm:p-3.5 border ${config.innerBoxBorder} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`inline-flex items-center gap-1.5 ${config.headerText}`}>
                  <Flame className="size-3.5 text-amber-500" /> Morning Bake Status
                </span>
                <span className={`text-[10px] font-mono uppercase font-bold ${config.subText}`}>
                  Stage 0{config.step}/03
                </span>
              </div>
              <p className={`text-xs leading-relaxed font-medium ${config.subText}`}>
                {config.desc}
              </p>

              {/* Visual 3-Stage Progress Bar */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className={`h-1.5 rounded-full ${config.step >= 1 ? "bg-amber-600" : "bg-black/10 dark:bg-white/10"}`} />
                <div className={`h-1.5 rounded-full ${config.step >= 2 ? "bg-amber-500" : "bg-black/10 dark:bg-white/10"}`} />
                <div className={`h-1.5 rounded-full ${config.step >= 3 ? "bg-emerald-500" : "bg-black/10 dark:bg-white/10"}`} />
              </div>
            </div>
          )}

          {/* 4. Bake Items List in INTER font with Matching Card Theme */}
          <div className={`rounded-2xl ${config.innerBoxBg} p-3 border ${config.innerBoxBorder} space-y-2`}>
            <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1.5 ${config.subText}`}>
              <span>Bake Items ({totalItemsCount})</span>
              {isMultiItem && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className={`flex items-center gap-1 font-bold text-xs lowercase transition-colors cursor-pointer ${config.iconColor}`}
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="size-3.5" /></>
                  ) : (
                    <>+{items.length - 2} more <ChevronDown className="size-3.5" /></>
                  )}
                </button>
              )}
            </div>

            <ul className="space-y-1.5 text-xs">
              {displayedItems.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-md ${config.tagBg} ${config.tagText} font-sans font-bold text-[11px]`}>
                      {item.quantity}×
                    </span>
                    {/* Bake Item Product Name in INTER font */}
                    <span className={`font-sans font-semibold text-xs truncate ${config.itemText}`}>
                      {item.product_name}
                    </span>
                  </div>
                  <span className={`font-sans font-bold shrink-0 text-xs tabular-nums ${config.subText}`}>
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
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${config.subText}`}>
            <div className="space-y-1 min-w-0">
              <p className={`flex items-center gap-1.5 truncate font-semibold ${config.headerText}`}>
                <Phone className={`size-3.5 shrink-0 ${config.iconColor}`} />
                <span className="truncate">{order.contact_phone} ({order.contact_name})</span>
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
              <p className={`font-sans text-xl sm:text-2xl font-black tracking-tight tabular-nums ${config.priceText}`}>
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
              <Button asChild className="w-full rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-10 shadow-lift cursor-pointer">
                <a href={order.payment_link_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5">
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
              Cancelling order #{order.id.slice(-6).toUpperCase()} will release the baking slot and initiate a 100% full refund to your original payment method.
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
      return order.status !== "completed" && order.status !== "delivered" && order.status !== "rejected";
    }
    if (filter === "completed") {
      return order.status === "completed" || order.status === "delivered";
    }
    return true;
  });

  const activeCount = orders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered" && o.status !== "rejected"
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === "completed" || o.status === "delivered"
  ).length;

  function handleOpenSupport(order?: OrderRecord) {
    setSelectedSupportOrder(order ?? null);
    setSupportModalOpen(true);
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20 text-center">
        <div className="relative mx-auto flex size-36 sm:size-44 items-center justify-center mb-4">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-contain pointer-events-none"
          >
            <source src="/illustration/3d-stickle-ai-analytics-report-on-clipboard.webm" type="video/webm" />
            <source src="/illustration/3d-stickle-ai-analytics-report-on-clipboard.mp4" type="video/mp4" />
          </video>
        </div>
        <h1 className="font-blogh uppercase tracking-wide text-3xl sm:text-4xl font-bold text-cocoa">
          No Orders Yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your morning slot is waiting. Explore our stone-hearth wild sourdoughs, French butter croissants, and custom celebration cakes.
        </p>
        <Button asChild className="mt-6 rounded-full bg-cocoa text-background hover:bg-cocoa/90 px-8 py-5 font-bold text-sm shadow-lift cursor-pointer">
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
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              <Sparkles className="size-3.5" />
              <span>Live Order Tracking</span>
            </span>
          </div>
          <h1 className="font-blogh text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight uppercase tracking-wide">
            Your Orders
          </h1>
        </div>

        {/* Top-Right: Help & Support Trigger */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenSupport()}
            className="rounded-full border-cocoa/30 bg-card text-cocoa hover:bg-cocoa/10 font-bold text-xs h-9 px-4 shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="size-4 text-berry" />
            <span>Help & Support</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Quick Stat Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/50 border border-border/60">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-cocoa text-background shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "active"
                ? "bg-cocoa text-background shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Slots ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "completed"
                ? "bg-cocoa text-background shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Delivered ({completedCount})
          </button>
        </div>

        <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block font-sans">
          Handcrafted in small batches every dawn from 4:00 AM
        </span>
      </div>

      {/* Orders Grid (1 Col Mobile, 2 Cols Tablet & Desktop) */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card p-10 text-center space-y-3 font-sans">
          <p className="font-bold text-base text-foreground">No orders found under this filter.</p>
          <p className="text-xs text-muted-foreground">Select 'All Orders' to view your complete order history.</p>
          <Button variant="outline" size="sm" onClick={() => setFilter("all")} className="rounded-full mt-2">
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