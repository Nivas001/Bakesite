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
} from "@/lib/admin.functions";
import {
  getAdminOfferCodes,
  saveAdminOfferCode,
  deleteAdminOfferCode,
} from "@/lib/offers.functions";
import { formatCurrency } from "@/lib/pricing";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bakery admin — Sweet Crumb" },
      { name: "description", content: "Manage orders, inventory and closed dates for Sweet Crumb Bakery." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bakery admin — Sweet Crumb" },
      { property: "og:description", content: "Order approvals and inventory for Sweet Crumb Bakery." },
    ],
  }),
  component: () => (
    <RequireAuth title="Bakery admin">
      <AdminDashboard />
    </RequireAuth>
  ),
});

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending approval",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  completed: "Completed",
  rejected: "Rejected",
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

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [offerForm, setOfferForm] = useState<OfferCodeForm>(EMPTY_OFFER_FORM);
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");

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

  const pending = data.orders.filter((o) => o.status === "pending_approval").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-cocoa">Bakery admin</h1>
      <p className="mt-2 text-muted-foreground">
        {pending} order{pending === 1 ? "" : "s"} waiting for approval · {data.products.length} products
      </p>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="offers">Offer codes</TabsTrigger>
          <TabsTrigger value="calendar">Closed dates</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-4">
          {data.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {data.orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">
                    {order.contact_name ?? "Customer"} · {formatCurrency(Number(order.total))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.fulfilment_type} · {order.slot_date} {order.slot_start.slice(0, 5)}–
                    {order.slot_end.slice(0, 5)} · {order.contact_phone}
                  </p>
                  {order.delivery_address && (
                    <p className="mt-1 text-sm text-muted-foreground">{order.delivery_address}</p>
                  )}
                  {order.delivery_lat != null && order.delivery_lng != null && (
                    <a
                      className="text-sm text-berry underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.openstreetmap.org/?mlat=${order.delivery_lat}&mlon=${order.delivery_lng}#map=17/${order.delivery_lat}/${order.delivery_lng}`}
                    >
                      View map pin
                    </a>
                  )}
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {order.order_items.map((item, index) => (
                      <li key={index}>
                        {item.quantity} × {item.product_name} — {formatCurrency(Number(item.line_total))}
                      </li>
                    ))}
                  </ul>
                  {order.notes && <p className="mt-2 text-sm italic">“{order.notes}”</p>}
                  {order.payment_link_url && (
                    <a
                      className="mt-2 block text-sm text-berry underline"
                      href={order.payment_link_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Payment link
                    </a>
                  )}
                </div>
                <span className="rounded-full bg-matcha px-3 py-1 text-xs font-semibold text-cocoa">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["awaiting_payment", "confirmed", "completed", "rejected"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={status === "rejected" ? "outline" : "default"}
                    className={status === "rejected" ? "" : "bg-berry text-berry-foreground hover:bg-berry/90"}
                    disabled={order.status === status}
                    onClick={() =>
                      run(
                        () => updateStatus({ data: { orderId: order.id, status } }),
                        `Order marked ${(STATUS_LABELS[status] ?? status).toLowerCase()}`,
                      )
                    }
                  >
                    {status === "awaiting_payment" ? "Approve" : (STATUS_LABELS[status] ?? status)}
                  </Button>
                ))}
              </div>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="inventory" className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-xl font-semibold">
              {form.id ? "Edit product" : "New product"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  value={form.name}
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
                <Label htmlFor="p-slug">Slug</Label>
                <Input id="p-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-price">Price (₹)</Label>
                  <Input id="p-price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="p-stock">Stock</Label>
                  <Input id="p-stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-dtype">Discount type</Label>
                  <select
                    id="p-dtype"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount_type: e.target.value as ProductForm["discount_type"] }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="percent">Percent</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="p-dval">Discount value</Label>
                  <Input
                    id="p-dval"
                    value={form.discount_value}
                    onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="p-cat">Category</Label>
                <select
                  id="p-cat"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
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
                <Label htmlFor="p-img">Image URL</Label>
                <Input id="p-img" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Visible in the shop
              </label>
              <div className="flex gap-2 pt-2">
                <Button
                  className="bg-berry text-berry-foreground hover:bg-berry/90"
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
                  Save product
                </Button>
                {form.id && (
                  <Button variant="outline" onClick={() => setForm(EMPTY_FORM)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {data.products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
              >
                <div>
                  <p className="font-medium">
                    {product.name}{" "}
                    {!product.is_active && (
                      <span className="text-xs text-muted-foreground">(hidden)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(product.price))} · stock {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
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
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => run(() => removeProductFn({ data: product.id }), "Product deleted")}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
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
      </Tabs>
    </div>
  );
}