import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createBlackout,
  deleteBlackout,
  deleteProduct,
  getAdminData,
  saveProduct,
  sendNewsletter,
  setOrderStatus,
  rescheduleOrderAdmin,
} from "@/lib/admin.functions";
import {
  getAdminOfferCodes,
  saveAdminOfferCode,
  deleteAdminOfferCode,
} from "@/lib/offers.functions";
import { formatCurrency } from "@/lib/pricing";
import { TIME_SLOTS, toISODate } from "@/lib/slots";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DevPanel } from "@/components/dev-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bakery admin — Ani Bakes" },
      { name: "description", content: "Manage orders, inventory and closed dates for Ani Bakes Bakery." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bakery admin — Ani Bakes" },
      { property: "og:description", content: "Order approvals and inventory for Ani Bakes Bakery." },
    ],
  }),
  component: () => (
    <RequireAuth title="Bakery admin">
      <AdminDashboard />
    </RequireAuth>
  ),
});

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Paid · Kitchen Review",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  rejected: "Rejected / Refunded",
};

const STATUS_ORDER_PRIORITY: Record<string, number> = {
  pending_approval: 0,
  rescheduled: 1,
  confirmed: 2,
  awaiting_payment: 3,
  completed: 4,
  rejected: 5,
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending_approval: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  awaiting_payment: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  rescheduled: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  completed: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount_type: "none" | "percent" | "flat";
  discount_value: string;
  image_url: string;
  stock: string;
  is_active: boolean;
  category_id: string;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  discount_type: "none",
  discount_value: "0",
  image_url: "",
  stock: "0",
  is_active: true,
  category_id: "",
};

type OfferCodeForm = {
  id?: string | undefined;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  min_order_amount: string;
  expires_at: string;
  description: string;
};

const EMPTY_OFFER_FORM: OfferCodeForm = {
  code: "",
  discount_type: "percent",
  discount_value: "10",
  min_order_amount: "0",
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  description: "",
};

function ProductAdminRow({
  product,
  categoryName,
  onEdit,
  onDelete,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount_type: "none" | "percent" | "flat";
    discount_value: number;
    image_url: string | null;
    stock: number;
    is_active: boolean;
    category_id: string | null;
  };
  categoryName?: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stock = Number(product.stock);
  const price = Number(product.price);
  const discountType = product.discount_type;
  const discountVal = Number(product.discount_value);

  let finalPrice = price;
  if (discountType === "percent" && discountVal > 0) {
    finalPrice = Math.max(0, price - (price * discountVal) / 100);
  } else if (discountType === "flat" && discountVal > 0) {
    finalPrice = Math.max(0, price - discountVal);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:border-berry/30 hover:shadow-lift">
      {/* Product Image & Details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-secondary border border-border/50 shadow-2xs">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground/60">
              🥖
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-base font-bold text-cocoa truncate">
              {product.name}
            </h4>

            {/* Visibility Badge */}
            {product.is_active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                ● Visible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Hidden
              </span>
            )}

            {/* Stock Level Badge */}
            {stock === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2 py-0.5 text-[10px] font-bold text-destructive">
                ❌ Out of stock
              </span>
            ) : stock <= 5 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                ⚠️ Low stock ({stock})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 border border-border/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Stock: {stock}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {/* Price & Discount */}
            <div className="flex items-center gap-1.5 font-semibold text-cocoa">
              {discountType !== "none" && discountVal > 0 ? (
                <>
                  <span className="text-berry">{formatCurrency(finalPrice)}</span>
                  <span className="text-xs line-through text-muted-foreground font-normal">
                    {formatCurrency(price)}
                  </span>
                  <span className="rounded bg-berry/15 px-1 py-0.5 text-[10px] font-bold text-berry">
                    {discountType === "percent" ? `${discountVal}% off` : `₹${discountVal} off`}
                  </span>
                </>
              ) : (
                <span>{formatCurrency(price)}</span>
              )}
            </div>

            {categoryName && (
              <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                📁 {categoryName}
              </span>
            )}

            <span className="font-mono text-[11px] text-muted-foreground/70 truncate max-w-[150px]">
              /{product.slug}
            </span>
          </div>

          {product.description && (
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-t border-border/40 pt-2 sm:border-t-0 sm:pt-0 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl h-8 px-3 text-xs font-semibold hover:border-berry/40"
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl h-8 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const loadData = useServerFn(getAdminData);
  const updateStatus = useServerFn(setOrderStatus);
  const persistProduct = useServerFn(saveProduct);
  const removeProductFn = useServerFn(deleteProduct);
  const addBlackoutFn = useServerFn(createBlackout);
  const removeBlackoutFn = useServerFn(deleteBlackout);
  const sendNewsletterFn = useServerFn(sendNewsletter);
  const fetchOfferCodesFn = useServerFn(getAdminOfferCodes);
  const saveOfferCodeFn = useServerFn(saveAdminOfferCode);
  const removeOfferCodeFn = useServerFn(deleteAdminOfferCode);
  const rescheduleFn = useServerFn(rescheduleOrderAdmin);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [offerForm, setOfferForm] = useState<OfferCodeForm>(EMPTY_OFFER_FORM);
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");

  // Postpone / Reschedule Dialog state
  const [reschedulingOrder, setReschedulingOrder] = useState<any>(null);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotId, setNewSlotId] = useState(TIME_SLOTS[0]!.id);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleBusy, setRescheduleBusy] = useState(false);

  const { data: offerCodes } = useQuery({
    queryKey: ["admin-offer-codes"],
    queryFn: () => fetchOfferCodesFn(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => loadData(),
    retry: false,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-data"] });

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      toast.success(message);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">Admins only</h1>
        <p className="mt-3 text-muted-foreground">
          This account doesn&apos;t have bakery admin access.
        </p>
      </div>
    );
  }

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSortBy, setOrderSortBy] = useState<string>("priority");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");

  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [userVerifiedFilter, setUserVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");

  const todayISO = toISODate(new Date());
  const pending = data.orders.filter((o) => o.status === "pending_approval").length;

  const usersList = data.users ?? [];
  const filteredUsers = usersList.filter((u) => {
    if (userVerifiedFilter === "verified" && !u.emailVerification) return false;
    if (userVerifiedFilter === "unverified" && u.emailVerification) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      const matchPhone = (u.phone || "").toLowerCase().includes(q);
      const matchAddress = (u.address || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchAddress;
    }
    return true;
  });

  const filteredOrders = data.orders.filter((order) => {
    if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchName = (order.contact_name || "").toLowerCase().includes(q);
      const matchPhone = (order.contact_phone || "").toLowerCase().includes(q);
      const matchAddress = (order.delivery_address || "").toLowerCase().includes(q);
      const matchId = (order.id || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchAddress || matchId;
    }
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (orderSortBy === "priority") {
      const pA = STATUS_ORDER_PRIORITY[a.status] ?? 99;
      const pB = STATUS_ORDER_PRIORITY[b.status] ?? 99;
      if (pA !== pB) return pA - pB;
      return new Date(b.created_at || b.slot_date).getTime() - new Date(a.created_at || a.slot_date).getTime();
    }
    if (orderSortBy === "date_asc") {
      return a.slot_date.localeCompare(b.slot_date) || a.slot_start.localeCompare(b.slot_start);
    }
    if (orderSortBy === "date_desc") {
      return b.slot_date.localeCompare(a.slot_date) || b.slot_start.localeCompare(a.slot_start);
    }
    if (orderSortBy === "amount_desc") {
      return Number(b.total) - Number(a.total);
    }
    if (orderSortBy === "amount_asc") {
      return Number(a.total) - Number(b.total);
    }
    if (orderSortBy === "newest") {
      return new Date(b.created_at || b.slot_date).getTime() - new Date(a.created_at || a.slot_date).getTime();
    }
    return 0;
  });

  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("all");
  const [inventorySortBy, setInventorySortBy] = useState<string>("name_asc");
  const [inventorySearchQuery, setInventorySearchQuery] = useState<string>("");
  const [inventoryStockFilter, setInventoryStockFilter] = useState<string>("all");

  const categoryMap = new Map<string, string>();
  for (const c of data.categories) {
    categoryMap.set(c.id, c.name);
  }

  const filteredProducts = data.products.filter((p) => {
    if (inventoryCategoryFilter !== "all") {
      if (inventoryCategoryFilter === "uncategorized") {
        if (p.category_id) return false;
      } else if (p.category_id !== inventoryCategoryFilter) {
        return false;
      }
    }
    if (inventoryStockFilter === "in_stock" && p.stock <= 0) return false;
    if (inventoryStockFilter === "low" && (p.stock <= 0 || p.stock > 5)) return false;
    if (inventoryStockFilter === "out" && p.stock > 0) return false;
    if (inventoryStockFilter === "active" && !p.is_active) return false;
    if (inventoryStockFilter === "hidden" && p.is_active) return false;

    if (inventorySearchQuery.trim()) {
      const q = inventorySearchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchCat = (p.category_id ? categoryMap.get(p.category_id) || "" : "").toLowerCase().includes(q);
      return matchName || matchDesc || matchSlug || matchCat;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (inventorySortBy === "name_asc") return a.name.localeCompare(b.name);
    if (inventorySortBy === "name_desc") return b.name.localeCompare(a.name);
    if (inventorySortBy === "price_asc") return Number(a.price) - Number(b.price);
    if (inventorySortBy === "price_desc") return Number(b.price) - Number(a.price);
    if (inventorySortBy === "stock_asc") return Number(a.stock) - Number(b.stock);
    if (inventorySortBy === "stock_desc") return Number(b.stock) - Number(a.stock);
    if (inventorySortBy === "active_first") return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
    return 0;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-cocoa">Bakery admin</h1>
      <p className="mt-2 text-muted-foreground">
        {pending} order{pending === 1 ? "" : "s"} waiting for approval · {data.products.length} products
      </p>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">
            Users ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="offers">Offer codes</TabsTrigger>
          <TabsTrigger value="calendar">Closed dates</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-5">
          {/* Filter & Sort Controls Bar */}
          <div className="flex flex-col gap-3.5 rounded-3xl border border-border/70 bg-card p-4 shadow-soft">
            {/* Status Filter Tabs with Counts */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Orders", count: data.orders.length },
                {
                  id: "pending_approval",
                  label: "Kitchen Queue",
                  count: data.orders.filter((o) => o.status === "pending_approval").length,
                },
                {
                  id: "confirmed",
                  label: "Confirmed",
                  count: data.orders.filter((o) => o.status === "confirmed").length,
                },
                {
                  id: "rescheduled",
                  label: "Rescheduled",
                  count: data.orders.filter((o) => o.status === "rescheduled").length,
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: data.orders.filter((o) => o.status === "completed").length,
                },
                {
                  id: "rejected",
                  label: "Rejected",
                  count: data.orders.filter((o) => o.status === "rejected").length,
                },
              ].map((pill) => {
                const isActive = orderStatusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(pill.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cocoa text-background shadow-sm"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-background/20 text-background"
                          : "bg-background/80 text-foreground"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar & Sort Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Input
                  placeholder="Search customer, phone, address…"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="h-9 text-xs pl-8 rounded-xl bg-background"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
                  🔍
                </span>
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Sort:
                </span>
                <select
                  value={orderSortBy}
                  onChange={(e) => setOrderSortBy(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="priority">Priority (Pending ➔ Confirmed ➔ Done)</option>
                  <option value="date_asc">Delivery Date (Earliest First)</option>
                  <option value="date_desc">Delivery Date (Latest First)</option>
                  <option value="amount_desc">Order Amount (High to Low)</option>
                  <option value="amount_asc">Order Amount (Low to High)</option>
                  <option value="newest">Newest Orders First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Cards Grid */}
          {sortedOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {orderSearchQuery || orderStatusFilter !== "all"
                  ? "No orders match your filter criteria."
                  : "No orders yet."}
              </p>
              {(orderSearchQuery || orderStatusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOrderStatusFilter("all");
                    setOrderSearchQuery("");
                  }}
                  className="mt-3 text-xs rounded-xl"
                >
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedOrders.map((order) => {
                const badgeStyle =
                  STATUS_BADGE_STYLES[order.status] ?? "bg-matcha text-cocoa";
                const isFutureDelivery = order.slot_date > todayISO;
                const isAlreadyCompleted = order.status === "completed";

                return (
                  <article
                    key={order.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-soft hover:shadow-lift transition-all"
                  >
                    <div>
                      {/* Card Header: Customer, Total, and Status */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                          <p className="font-display text-base font-bold text-cocoa truncate">
                            {order.contact_name ?? "Customer"}
                          </p>
                          <p className="font-sans text-lg font-extrabold text-foreground tracking-tight mt-0.5">
                            {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${badgeStyle}`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </div>

                      {/* Fulfilment & Timing Details */}
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between font-medium text-foreground">
                          <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] capitalize">
                            {order.fulfilment_type}
                          </span>
                          <span className="font-mono text-[11px]">
                            {order.slot_date} ({order.slot_start.slice(0, 5)}–{order.slot_end.slice(0, 5)})
                          </span>
                        </div>

                        <p className="pt-0.5">📞 {order.contact_phone}</p>

                        {order.delivery_address && (
                          <p className="line-clamp-2 leading-tight">
                            📍 {order.delivery_address}
                          </p>
                        )}

                        {order.delivery_lat != null && order.delivery_lng != null && (
                          <a
                            className="inline-flex items-center gap-1 text-xs text-berry font-semibold underline hover:text-berry/80 pt-0.5"
                            target="_blank"
                            rel="noreferrer"
                            href={`https://www.openstreetmap.org/?mlat=${order.delivery_lat}&mlon=${order.delivery_lng}#map=17/${order.delivery_lat}/${order.delivery_lng}`}
                          >
                            🗺️ View map pin
                          </a>
                        )}
                      </div>

                      {/* Ordered Items Pill Container */}
                      <div className="mt-3.5 rounded-2xl bg-secondary/30 p-3 border border-border/40">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Items ({order.order_items.reduce((s, i) => s + i.quantity, 0)})
                        </p>
                        <ul className="space-y-1 text-xs text-foreground/90 max-h-32 overflow-y-auto pr-1">
                          {order.order_items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-[11px]">
                              <span className="truncate pr-2">
                                <span className="font-bold text-berry">{item.quantity}×</span> {item.product_name}
                              </span>
                              <span className="font-semibold shrink-0">
                                {formatCurrency(Number(item.line_total))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.notes && (
                        <p className="mt-2 text-xs italic text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/40">
                          “{order.notes}”
                        </p>
                      )}

                      {order.contact_phone && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <a
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 transition-all"
                            href={(() => {
                              const cleanDigits = (order.contact_phone || "").replace(/\D/g, "");
                              const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
                              const shortId = order.id.slice(0, 8);
                              const itemsText = order.order_items.map((i) => `• ${i.quantity}× ${i.product_name} (${formatCurrency(Number(i.line_total))})`).join("\n");
                              
                              const origin = typeof window !== "undefined" ? window.location.origin : "https://bakesite.vercel.app";
                              const myOrdersUrl = `${origin}/orders`;
                              
                              let message = `🎂 *Ani Bakes Bakery — Order #${shortId}*\n\nHi ${order.contact_name ?? "there"},\n`;
                              if (order.status === "pending_approval") {
                                message += `We have received your payment of *${formatCurrency(Number(order.total))}*! Our head baker is reviewing the schedule for your requested slot.\n\n📦 *Items:*\n${itemsText}\n\n🕒 *Requested Slot:* ${order.slot_date} (${order.slot_start.slice(0, 5)} - ${order.slot_end.slice(0, 5)})\n\n👉 *Track your order:* ${myOrdersUrl}\n\nThank you!`;
                              } else if (order.status === "confirmed") {
                                message += `Your bakery order is *confirmed*! Our bakers will prepare it fresh for your slot.\n\n📦 *Items:*\n${itemsText}\n\n🕒 *Slot:* ${order.slot_date} (${order.slot_start.slice(0, 5)} - ${order.slot_end.slice(0, 5)})\n\n👉 *Track your order here:* ${myOrdersUrl}\n\nThank you for choosing Ani Bakes!`;
                              } else if (order.status === "rescheduled") {
                                message += `Update on your order: The head baker has adjusted your scheduled baking slot to *${order.slot_date} (${order.slot_start.slice(0, 5)} - ${order.slot_end.slice(0, 5)})*.\n\n📦 *Items:*\n${itemsText}\n\n👉 *View details on our site:* ${myOrdersUrl}\n\nAni Bakes Bakery`;
                              } else {
                                message += `Here is your order summary for *${formatCurrency(Number(order.total))}*.\n\n📦 *Items:*\n${itemsText}\n\n🕒 *Slot:* ${order.slot_date} (${order.slot_start.slice(0, 5)} - ${order.slot_end.slice(0, 5)})\n\n👉 *View order:* ${myOrdersUrl}`;
                              }

                              return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
                            })()}
                            target="_blank"
                            rel="noreferrer"
                          >
                            💬 Send on WhatsApp
                          </a>

                          {order.payment_link_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-7 px-2 text-[11px] font-semibold"
                              onClick={() => {
                                navigator.clipboard.writeText(order.payment_link_url!);
                                toast.success("Payment link copied to clipboard!");
                              }}
                            >
                              📋 Copy Link
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Action Buttons */}
                    <div className="mt-4 border-t border-border/60 pt-3 grid grid-cols-2 gap-2">
                      {/* Confirm button */}
                      <Button
                        size="sm"
                        disabled={order.status === "confirmed"}
                        className={`h-8 text-xs font-semibold rounded-xl ${
                          order.status === "confirmed"
                            ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                        onClick={() =>
                          run(
                            () => updateStatus({ data: { orderId: order.id, status: "confirmed" } }),
                            "Order confirmed & customer emailed!",
                          )
                        }
                      >
                        {order.status === "confirmed" ? "✓ Confirmed" : "✅ Confirm"}
                      </Button>

                      {/* Postpone / Reschedule button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold rounded-xl border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                        onClick={() => {
                          setReschedulingOrder(order);
                          setNewSlotDate(order.slot_date);
                          const matchingSlot = TIME_SLOTS.find((s) => s.start === order.slot_start);
                          setNewSlotId(matchingSlot ? matchingSlot.id : TIME_SLOTS[0]!.id);
                          setRescheduleReason("");
                        }}
                      >
                        🕒 Reschedule
                      </Button>

                      {/* Complete button */}
                      <Button
                        size="sm"
                        disabled={
                          order.status === "completed" ||
                          (isFutureDelivery && !isAlreadyCompleted)
                        }
                        title={
                          isFutureDelivery && !isAlreadyCompleted
                            ? `Can only complete on or after delivery day (${order.slot_date})`
                            : undefined
                        }
                        className={`h-8 text-xs font-semibold rounded-xl ${
                          order.status === "completed"
                            ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                            : isFutureDelivery && !isAlreadyCompleted
                            ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                            : "bg-berry text-berry-foreground hover:bg-berry/90"
                        }`}
                        onClick={() =>
                          run(
                            () => updateStatus({ data: { orderId: order.id, status: "completed" } }),
                            "Order completed!",
                          )
                        }
                      >
                        {isFutureDelivery && !isAlreadyCompleted ? `🔒 Due ${order.slot_date.slice(5)}` : "Completed"}
                      </Button>

                      {/* Reject / Refund button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel & refund Order #${order.id.slice(0, 8)}?`)) {
                            run(
                              () => updateStatus({ data: { orderId: order.id, status: "rejected" } }),
                              "Order cancelled and refund email sent.",
                            );
                          }
                        }}
                      >
                        Cancel / Refund
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* PRODUCT FORM */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft h-fit sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-cocoa">
                {form.id ? "Edit product" : "New product"}
              </h2>
              {form.id && (
                <span className="rounded-full bg-berry/15 border border-berry/30 px-2 py-0.5 text-[10px] font-bold text-berry">
                  Editing
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="p-name" className="text-xs font-semibold">Name <span className="text-berry">*</span></Label>
                <Input
                  id="p-name"
                  value={form.name}
                  placeholder="e.g. Sourdough Loaf"
                  className="rounded-xl h-9 text-xs mt-1"
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: f.id
                        ? f.slug
                        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="p-slug" className="text-xs font-semibold">URL Slug</Label>
                <Input
                  id="p-slug"
                  value={form.slug}
                  placeholder="sourdough-loaf"
                  className="rounded-xl h-9 text-xs font-mono mt-1"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="p-desc" className="text-xs font-semibold">Description</Label>
                <Textarea
                  id="p-desc"
                  value={form.description}
                  rows={2}
                  placeholder="Fresh artisan bread made daily…"
                  className="rounded-xl text-xs mt-1"
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-price" className="text-xs font-semibold">Price (₹) <span className="text-berry">*</span></Label>
                  <Input
                    id="p-price"
                    type="number"
                    value={form.price}
                    className="rounded-xl h-9 text-xs mt-1"
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p-stock" className="text-xs font-semibold">Stock Quantity</Label>
                  <Input
                    id="p-stock"
                    type="number"
                    value={form.stock}
                    className="rounded-xl h-9 text-xs mt-1"
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-dtype" className="text-xs font-semibold">Discount Type</Label>
                  <select
                    id="p-dtype"
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs mt-1 cursor-pointer"
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount_type: e.target.value as ProductForm["discount_type"] }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="p-dval" className="text-xs font-semibold">Discount Value</Label>
                  <Input
                    id="p-dval"
                    type="number"
                    value={form.discount_value}
                    className="rounded-xl h-9 text-xs mt-1"
                    onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="p-cat" className="text-xs font-semibold">Bakery Category</Label>
                <select
                  id="p-cat"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs mt-1 cursor-pointer"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                >
                  <option value="">Uncategorised</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="p-img" className="text-xs font-semibold">Image URL</Label>
                <Input
                  id="p-img"
                  value={form.image_url}
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-xl h-9 text-xs mt-1"
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-input text-berry"
                />
                Visible in the public shop
              </label>

              <div className="flex gap-2 pt-3">
                <Button
                  className="flex-1 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 h-10 font-semibold text-xs"
                  onClick={() =>
                    run(async () => {
                      await persistProduct({
                        data: {
                          ...(form.id ? { id: form.id } : {}),
                          name: form.name,
                          slug: form.slug,
                          description: form.description || null,
                          price: Number(form.price),
                          discount_type: form.discount_type,
                          discount_value: Number(form.discount_value),
                          image_url: form.image_url || null,
                          stock: Number(form.stock),
                          is_active: form.is_active,
                          category_id: form.category_id || null,
                        },
                      });
                      setForm(EMPTY_FORM);
                    }, "Product saved")
                  }
                >
                  {form.id ? "Update Product" : "Create Product"}
                </Button>
                {form.id && (
                  <Button
                    variant="outline"
                    className="rounded-2xl h-10 text-xs"
                    onClick={() => setForm(EMPTY_FORM)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* INVENTORY LIST WITH CATEGORY-WISE GROUPING & SORT CONTROLS */}
          <div className="space-y-5">
            {/* Category Filter Pills */}
            <div className="flex flex-col gap-3.5 rounded-3xl border border-border/70 bg-card p-4 shadow-soft">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Browse by Category
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setInventoryCategoryFilter("all")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      inventoryCategoryFilter === "all"
                        ? "bg-cocoa text-background shadow-xs"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span>All Categories</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        inventoryCategoryFilter === "all"
                          ? "bg-background/20 text-background"
                          : "bg-background/80 text-foreground"
                      }`}
                    >
                      {data.products.length}
                    </span>
                  </button>

                  {data.categories.map((cat) => {
                    const count = data.products.filter((p) => p.category_id === cat.id).length;
                    const isActive = inventoryCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setInventoryCategoryFilter(cat.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-cocoa text-background shadow-xs"
                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-background/20 text-background"
                              : "bg-background/80 text-foreground"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {data.products.some((p) => !p.category_id) && (
                    <button
                      type="button"
                      onClick={() => setInventoryCategoryFilter("uncategorized")}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        inventoryCategoryFilter === "uncategorized"
                          ? "bg-cocoa text-background shadow-xs"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <span>Uncategorised</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          inventoryCategoryFilter === "uncategorized"
                            ? "bg-background/20 text-background"
                            : "bg-background/80 text-foreground"
                        }`}
                      >
                        {data.products.filter((p) => !p.category_id).length}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search, Stock Filter & Sorting Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Input
                    placeholder="Search product name, slug…"
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    className="h-9 text-xs pl-8 rounded-xl bg-background"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
                    🔍
                  </span>
                  {inventorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInventorySearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={inventoryStockFilter}
                    onChange={(e) => setInventoryStockFilter(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs font-semibold shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="in_stock">In Stock (&gt;0)</option>
                    <option value="low">⚠️ Low Stock (1–5)</option>
                    <option value="out">❌ Out of Stock (0)</option>
                    <option value="active">Visible in Shop</option>
                    <option value="hidden">Hidden Only</option>
                  </select>

                  <select
                    value={inventorySortBy}
                    onChange={(e) => setInventorySortBy(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs font-semibold shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="stock_asc">Stock: Low First (Alerts)</option>
                    <option value="stock_desc">Stock: High to Low</option>
                    <option value="active_first">Visible Items First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Display (Grouped by Category or Filtered) */}
            {sortedProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {inventorySearchQuery || inventoryStockFilter !== "all" || inventoryCategoryFilter !== "all"
                    ? "No bakery items match your filter criteria."
                    : "No products in inventory yet."}
                </p>
                {(inventorySearchQuery || inventoryStockFilter !== "all" || inventoryCategoryFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-xl text-xs"
                    onClick={() => {
                      setInventorySearchQuery("");
                      setInventoryStockFilter("all");
                      setInventoryCategoryFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : inventoryCategoryFilter !== "all" ? (
              /* Single Category View */
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-display text-xl font-bold text-cocoa">
                    {inventoryCategoryFilter === "uncategorized"
                      ? "Uncategorised Items"
                      : categoryMap.get(inventoryCategoryFilter) || "Category"}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="space-y-3">
                  {sortedProducts.map((product) => (
                    <ProductAdminRow
                      key={product.id}
                      product={product}
                      categoryName={product.category_id ? categoryMap.get(product.category_id) : undefined}
                      onEdit={() => {
                        setForm({
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          description: product.description ?? "",
                          price: String(product.price),
                          discount_type: product.discount_type,
                          discount_value: String(product.discount_value),
                          image_url: product.image_url ?? "",
                          stock: String(product.stock),
                          is_active: product.is_active,
                          category_id: product.category_id ?? "",
                        });
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      onDelete={() =>
                        run(() => removeProductFn({ data: product.id }), "Product deleted")
                      }
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Grouped by Category View */
              <div className="space-y-8">
                {data.categories.map((cat) => {
                  const catProducts = sortedProducts.filter((p) => p.category_id === cat.id);
                  if (catProducts.length === 0) return null;
                  const totalStock = catProducts.reduce((sum, p) => sum + Number(p.stock), 0);

                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-cocoa">{cat.name}</h3>
                          <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                            {catProducts.length} {catProducts.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {totalStock} total in stock
                        </span>
                      </div>

                      <div className="space-y-3">
                        {catProducts.map((product) => (
                          <ProductAdminRow
                            key={product.id}
                            product={product}
                            categoryName={cat.name}
                            onEdit={() => {
                              setForm({
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                description: product.description ?? "",
                                price: String(product.price),
                                discount_type: product.discount_type,
                                discount_value: String(product.discount_value),
                                image_url: product.image_url ?? "",
                                stock: String(product.stock),
                                is_active: product.is_active,
                                category_id: product.category_id ?? "",
                              });
                              window.scrollTo({ top: 180, behavior: "smooth" });
                            }}
                            onDelete={() =>
                              run(() => removeProductFn({ data: product.id }), "Product deleted")
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Uncategorized products section */}
                {sortedProducts.some((p) => !p.category_id) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-cocoa">Uncategorised</h3>
                        <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                          {sortedProducts.filter((p) => !p.category_id).length} items
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {sortedProducts
                        .filter((p) => !p.category_id)
                        .map((product) => (
                          <ProductAdminRow
                            key={product.id}
                            product={product}
                            onEdit={() => {
                              setForm({
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                description: product.description ?? "",
                                price: String(product.price),
                                discount_type: product.discount_type,
                                discount_value: String(product.discount_value),
                                image_url: product.image_url ?? "",
                                stock: String(product.stock),
                                is_active: product.is_active,
                                category_id: product.category_id ?? "",
                              });
                              window.scrollTo({ top: 180, behavior: "smooth" });
                            }}
                            onDelete={() =>
                              run(() => removeProductFn({ data: product.id }), "Product deleted")
                            }
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6 max-w-xl space-y-4">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Close a date</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
              <div>
                <Label htmlFor="b-date">Date</Label>
                <Input id="b-date" type="date" value={blackoutDate} onChange={(e) => setBlackoutDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="b-reason">Reason</Label>
                <Input id="b-reason" value={blackoutReason} onChange={(e) => setBlackoutReason(e.target.value)} />
              </div>
              <Button
                className="bg-berry text-berry-foreground hover:bg-berry/90"
                onClick={() =>
                  run(async () => {
                    await addBlackoutFn({
                      data: { blackout_date: blackoutDate, reason: blackoutReason || undefined },
                    });
                    setBlackoutDate("");
                    setBlackoutReason("");
                  }, "Date closed")
                }
              >
                Add
              </Button>
            </div>
          </div>

          {data.blackouts.map((blackout) => (
            <div
              key={blackout.id}
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4"
            >
              <p className="text-sm">
                {blackout.blackout_date}
                {blackout.reason ? ` — ${blackout.reason}` : ""}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(() => removeBlackoutFn({ data: blackout.id }), "Date reopened")}
              >
                Remove
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="newsletter" className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Compose a newsletter</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sends to {data.subscribers.filter((s) => s.is_subscribed).length} subscriber
              {data.subscribers.filter((s) => s.is_subscribed).length === 1 ? "" : "s"} through Mailgun.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="n-subject">Subject</Label>
                <Input id="n-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="n-body">Message</Label>
                <Textarea
                  id="n-body"
                  rows={10}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                />
              </div>
              <Button
                className="bg-berry text-berry-foreground hover:bg-berry/90"
                onClick={() =>
                  run(async () => {
                    await sendNewsletterFn({ data: { subject, body: bodyText } });
                    setSubject("");
                    setBodyText("");
                  }, "Newsletter sent")
                }
              >
                Send newsletter
              </Button>
            </div>

            {data.campaigns.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold">Recently sent</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {data.campaigns.map((campaign) => (
                    <li key={campaign.id}>
                      {new Date(campaign.sent_at).toLocaleDateString()} · {campaign.subject} —{" "}
                      {campaign.recipients} recipients
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Subscribers</h2>
            <ul className="mt-3 max-h-[420px] space-y-1 overflow-auto text-sm text-muted-foreground">
              {data.subscribers.length === 0 && <li>No subscribers yet.</li>}
              {data.subscribers.map((subscriber) => (
                <li key={subscriber.id}>{subscriber.email}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total orders", value: String(data.stats.totalOrders) },
              { label: "Orders (30 days)", value: String(data.stats.ordersLast30Days) },
              { label: "Paid revenue", value: formatCurrency(data.stats.revenue) },
              { label: "Average order", value: formatCurrency(data.stats.averageOrder) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-cocoa">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
              <h2 className="font-display text-xl font-semibold">Orders by status</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {Object.entries(data.stats.byStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <span>{STATUS_LABELS[status] ?? status}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
              <h2 className="font-display text-xl font-semibold">Best sellers</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.stats.topProducts.length === 0 && (
                  <li className="text-muted-foreground">No sales yet.</li>
                )}
                {data.stats.topProducts.map((product) => (
                  <li key={product.name} className="flex items-center justify-between">
                    <span>{product.name}</span>
                    <span className="font-semibold">
                      {product.quantity} · {formatCurrency(product.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Heatmaps and session recordings run through Microsoft Clarity. Add your Clarity project id
            as <code>VITE_CLARITY_PROJECT_ID</code> and the tracking tag loads on every page.
          </p>
        </TabsContent>

        <TabsContent value="offers" className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-xl font-semibold">
              {offerForm.id ? "Edit offer code" : "New offer code"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="o-code">Code (e.g. FESTIVE20)</Label>
                <Input
                  id="o-code"
                  placeholder="SWEET20"
                  value={offerForm.code}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, code: e.target.value.toUpperCase().trim() }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="o-type">Discount type</Label>
                  <select
                    id="o-type"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={offerForm.discount_type}
                    onChange={(e) =>
                      setOfferForm((f) => ({
                        ...f,
                        discount_type: e.target.value as "percent" | "flat",
                      }))
                    }
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="o-val">Discount value</Label>
                  <Input
                    id="o-val"
                    type="number"
                    value={offerForm.discount_value}
                    onChange={(e) =>
                      setOfferForm((f) => ({ ...f, discount_value: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="o-min">Min order amount (₹)</Label>
                <Input
                  id="o-min"
                  type="number"
                  placeholder="0"
                  value={offerForm.min_order_amount}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, min_order_amount: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="o-expiry">Valid until (Expiry Date & Time)</Label>
                <Input
                  id="o-expiry"
                  type="datetime-local"
                  value={offerForm.expires_at}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, expires_at: e.target.value }))
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The code automatically expires past this timestamp.
                </p>
              </div>

              <div>
                <Label htmlFor="o-desc">Description (optional)</Label>
                <Input
                  id="o-desc"
                  placeholder="e.g. 20% off for festival season"
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="bg-berry text-berry-foreground hover:bg-berry/90"
                  onClick={() =>
                    run(async () => {
                      if (!offerForm.code || !offerForm.discount_value || !offerForm.expires_at) {
                        toast.error("Please fill in code, discount value, and expiry date.");
                        return;
                      }
                      await saveOfferCodeFn({
                        data: {
                          ...(offerForm.id ? { id: offerForm.id } : {}),
                          code: offerForm.code,
                          discount_type: offerForm.discount_type,
                          discount_value: Number(offerForm.discount_value),
                          min_order_amount: Number(offerForm.min_order_amount || 0),
                          expires_at: new Date(offerForm.expires_at).toISOString(),
                          description: offerForm.description || undefined,
                          is_active: true,
                        },
                      });
                      setOfferForm(EMPTY_OFFER_FORM);
                      queryClient.invalidateQueries({ queryKey: ["admin-offer-codes"] });
                    }, "Offer code saved")
                  }
                >
                  Save offer code
                </Button>
                {offerForm.id && (
                  <Button variant="outline" onClick={() => setOfferForm(EMPTY_OFFER_FORM)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(!offerCodes || offerCodes.length === 0) && (
              <p className="text-sm text-muted-foreground">No offer codes created yet.</p>
            )}
            {offerCodes?.map((offer) => {
              const isExpired = new Date(offer.expires_at).getTime() <= Date.now();
              return (
                <div
                  key={offer.id ?? offer.code}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-berry bg-berry/10 px-2 py-0.5 rounded-lg border border-berry/20">
                        {offer.code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isExpired
                            ? "bg-destructive/15 text-destructive"
                            : "bg-matcha text-cocoa"
                        }`}
                      >
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-medium text-foreground">
                      {offer.discount_type === "percent"
                        ? `${offer.discount_value}% off`
                        : `₹${offer.discount_value} flat off`}
                      {offer.min_order_amount > 0 ? ` on orders above ₹${offer.min_order_amount}` : ""}
                    </p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expires: {new Date(offer.expires_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {offer.description ? ` · ${offer.description}` : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setOfferForm({
                          id: offer.id,
                          code: offer.code,
                          discount_type: offer.discount_type,
                          discount_value: String(offer.discount_value),
                          min_order_amount: String(offer.min_order_amount),
                          expires_at: new Date(offer.expires_at).toISOString().slice(0, 16),
                          description: offer.description ?? "",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        run(async () => {
                          if (offer.id) {
                            await removeOfferCodeFn({ data: offer.id });
                            queryClient.invalidateQueries({ queryKey: ["admin-offer-codes"] });
                          }
                        }, "Offer code deleted")
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* USERS / CUSTOMER ACCOUNTS TAB */}
        <TabsContent value="users" className="mt-6 space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Registered Accounts
              </span>
              <p className="mt-2 font-display text-3xl font-bold text-cocoa">{usersList.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Accounts created on Ani Bakes</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Verified Emails
              </span>
              <p className="mt-2 font-display text-3xl font-bold text-cocoa">
                {usersList.filter((u) => u.emailVerification).length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Email addresses confirmed</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-berry">
                Active Buyers
              </span>
              <p className="mt-2 font-display text-3xl font-bold text-cocoa">
                {usersList.filter((u) => u.totalOrders > 0).length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Customers who placed orders</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search by customer name, email, phone…"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="h-10 text-xs pl-8 rounded-xl bg-background"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
                🔍
              </span>
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: "All Users", count: usersList.length },
                {
                  id: "verified",
                  label: "Verified",
                  count: usersList.filter((u) => u.emailVerification).length,
                },
                {
                  id: "unverified",
                  label: "Pending",
                  count: usersList.filter((u) => !u.emailVerification).length,
                },
              ].map((pill) => {
                const isActive = userVerifiedFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setUserVerifiedFilter(pill.id as "all" | "verified" | "unverified")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cocoa text-background shadow-xs"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? "bg-background/20 text-background" : "bg-background/80 text-foreground"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Users List Grid / Table */}
          {filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {userSearchQuery || userVerifiedFilter !== "all"
                  ? "No user accounts match your filter criteria."
                  : "No registered users found yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const initials = (user.name || "CU")
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const formattedCreated = user.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown";

                const formattedAccessed = user.accessedAt
                  ? new Date(user.accessedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : formattedCreated;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:border-berry/30 hover:shadow-lift"
                  >
                    {/* User Info & Avatar */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-berry/15 font-display text-sm font-bold text-berry shadow-2xs">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold text-cocoa truncate">
                            {user.name}
                          </h3>
                          {user.emailVerification ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              Pending Verification
                            </span>
                          )}
                          {user.totalOrders > 0 && (
                            <span className="rounded-full bg-berry/10 border border-berry/20 px-2 py-0.5 text-[10px] font-bold text-berry">
                              {user.totalOrders} order{user.totalOrders === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">{user.email}</span>
                          {user.phone ? (
                            <span className="font-semibold text-cocoa/90">📞 {user.phone}</span>
                          ) : (
                            <span className="italic text-muted-foreground/60">No phone</span>
                          )}
                        </div>

                        {user.address && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-1">
                            📍 {user.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Registration & Last Login Times */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 border-t border-border/40 pt-3 lg:border-t-0 lg:pt-0 shrink-0 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Registered On
                        </p>
                        <p className="font-medium text-cocoa/90">{formattedCreated}</p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Last Logged In
                        </p>
                        <p className="font-medium text-berry">{formattedAccessed}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs h-8"
                        onClick={() => {
                          navigator.clipboard.writeText(user.email);
                          toast.success(`Copied ${user.email} to clipboard!`);
                        }}
                      >
                        Copy Email
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Postpone / Reschedule Slot Dialog */}
      <Dialog
        open={!!reschedulingOrder}
        onOpenChange={(open) => {
          if (!open) {
            setReschedulingOrder(null);
            setRescheduleReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[460px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-cocoa">
              Postpone / Reschedule Baking Slot
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust the delivery/pickup slot for Order #{reschedulingOrder?.id?.slice(0, 8)}. An automated email will be sent to {reschedulingOrder?.contact_name || "the customer"}.
            </DialogDescription>
          </DialogHeader>

          {reschedulingOrder && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newSlotDate) {
                  toast.error("Please pick a new date");
                  return;
                }
                setRescheduleBusy(true);
                try {
                  await rescheduleFn({
                    data: {
                      orderId: reschedulingOrder.id,
                      newSlotDate,
                      newSlotId,
                      reason: rescheduleReason.trim() || undefined,
                    },
                  });
                  toast.success(`Order rescheduled to ${newSlotDate}! Customer notified via email.`);
                  setReschedulingOrder(null);
                  setRescheduleReason("");
                  await refresh();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to reschedule order");
                } finally {
                  setRescheduleBusy(false);
                }
              }}
              className="space-y-4 py-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-date" className="text-xs font-semibold text-foreground">
                  New Baking & Delivery Date
                </Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={newSlotDate}
                  min={toISODate(new Date())}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  required
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-slot" className="text-xs font-semibold text-foreground">
                  New Time Window
                </Label>
                <select
                  id="reschedule-slot"
                  value={newSlotId}
                  onChange={(e) => setNewSlotId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-berry"
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.start.slice(0, 5)} - {s.end.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-reason" className="text-xs font-semibold text-foreground">
                  Reason / Note to Customer from Baker (optional)
                </Label>
                <Textarea
                  id="reschedule-reason"
                  placeholder="e.g. Morning oven batch at full capacity — moved to afternoon fresh bake."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={3}
                  className="rounded-xl text-xs resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  This note will be included in the automated email sent to the customer.
                </p>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReschedulingOrder(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={rescheduleBusy}
                  size="sm"
                  className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold text-xs"
                >
                  {rescheduleBusy ? "Updating…" : "Confirm & Send Email"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <DevPanel />
    </div>
  );
}