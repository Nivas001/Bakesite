import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { toast } from "sonner";
import { getBlackoutDates } from "@/lib/catalog.functions";
import { getMyProfile, placeOrder } from "@/lib/orders.functions";
import { RequireAuth } from "@/components/require-auth";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/pricing";
import { TIME_SLOTS, formatSlotDate, selectableDates } from "@/lib/slots";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Phone,
  MapPin,
  Pencil,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Coffee,
  Moon,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

const LocationPicker = lazy(() => import("@/components/location-picker"));

const SLOT_METADATA: Record<string, { icon: typeof Sunrise; tag: string; period: string }> = {
  morning: { icon: Sunrise, tag: "Fresh from oven", period: "Morning" },
  midday: { icon: Sun, tag: "Peak warmth", period: "Midday" },
  afternoon: { icon: Coffee, tag: "Tea & treats", period: "Afternoon" },
  evening: { icon: Moon, tag: "Evening bakes", period: "Evening" },
};

function parseDateParts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dateObj = new Date(y!, (m ?? 1) - 1, d);
  const weekdayShort = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
  const weekdayLong = dateObj.toLocaleDateString("en-IN", { weekday: "long" });
  const day = d!;
  const monthShort = dateObj.toLocaleDateString("en-IN", { month: "short" });
  return { weekdayShort, weekdayLong, day, monthShort };
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sweet Crumb Bakery" },
      { name: "description", content: "Pick a next-day delivery or pickup slot for your bakes." },
      { property: "og:title", content: "Checkout — Sweet Crumb Bakery" },
      { property: "og:description", content: "Pick a next-day delivery or pickup slot." },
    ],
  }),
  component: () => (
    <RequireAuth title="Checkout">
      <CheckoutPage />
    </RequireAuth>
  ),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, total, discountTotal, subtotal, clear } = useCart();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchBlackout = useServerFn(getBlackoutDates);
  const submitOrder = useServerFn(placeOrder);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: blackout } = useQuery({ queryKey: ["blackout"], queryFn: () => fetchBlackout() });

  const [fulfilmentType, setFulfilmentType] = useState<"delivery" | "pickup">("delivery");
  const [slotDate, setSlotDate] = useState("");
  const [slotId, setSlotId] = useState(TIME_SLOTS[0]!.id);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const dates = selectableDates(
    (blackout ?? []).map((b) => b.blackout_date),
    5,
  );

  useEffect(() => {
    if (dates.length > 0 && (!slotDate || !dates.includes(slotDate))) {
      setSlotDate(dates[0]!);
    }
  }, [dates, slotDate]);

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">Nothing to check out</h1>
        <Button asChild className="mt-8 bg-berry text-berry-foreground hover:bg-berry/90">
          <Link to="/shop">Browse the bakery</Link>
        </Button>
      </div>
    );
  }

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    if (!profile) {
      toast.error("Profile information is missing");
      setBusy(false);
      return;
    }

    try {
      await submitOrder({
        data: {
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          slotDate,
          slotId,
          fulfilmentType,
          contactName: profile.full_name,
          contactPhone: profile.phone,
          address: fulfilmentType === "delivery" ? profile.address : "",
          latitude: fulfilmentType === "delivery" ? profile.latitude : null,
          longitude: fulfilmentType === "delivery" ? profile.longitude : null,
          notes: notes || undefined,
        },
      });
      clear();
      toast.success("Order placed — we'll confirm your slot shortly.");
      navigate({ to: "/orders" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  const selectedSlot = TIME_SLOTS.find((s) => s.id === slotId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-cocoa">Choose your slot</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Orders need one day of notice. We confirm availability before asking for payment.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Fulfilment Type */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Delivery or pickup</h2>
            <div className="mt-4 flex gap-2">
              {(["delivery", "pickup"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={fulfilmentType === option ? "default" : "outline"}
                  onClick={() => setFulfilmentType(option)}
                  className={`capitalize rounded-xl ${
                    fulfilmentType === option
                      ? "bg-berry text-berry-foreground font-semibold"
                      : "hover:border-berry/40"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </section>

          {/* Separate Date and Time Window Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bento Date Card */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-berry" />
                  <h2 className="font-display text-lg font-semibold">Date</h2>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Select next available baking & dispatch day
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dates.map((date, idx) => {
                    const { weekdayShort, weekdayLong, day, monthShort } = parseDateParts(date);
                    const isSelected = slotDate === date;
                    const isEarliest = idx === 0;

                    if (isEarliest) {
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSlotDate(date)}
                          className={`group relative sm:col-span-2 flex items-center justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-berry bg-berry/10 text-foreground ring-2 ring-berry shadow-xs"
                              : "border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl transition-colors ${
                                isSelected
                                  ? "bg-berry text-berry-foreground font-bold"
                                  : "bg-muted text-foreground group-hover:bg-berry/10 group-hover:text-berry"
                              }`}
                            >
                              <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                                {weekdayShort}
                              </span>
                              <span className="text-base font-extrabold leading-none mt-0.5">{day}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-sans font-bold text-sm text-foreground tracking-tight">
                                  {weekdayLong}, {day} {monthShort}
                                </p>
                              </div>
                              <p className="text-[11px] text-muted-foreground">Next Available Dispatch</p>
                            </div>
                          </div>

                          <div>
                            {isSelected ? (
                              <span className="flex items-center gap-1 rounded-full bg-berry px-2 py-0.5 text-[10px] font-bold text-berry-foreground">
                                <Check className="h-3 w-3" /> Selected
                              </span>
                            ) : (
                              <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                Earliest
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSlotDate(date)}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-berry bg-berry/10 text-foreground ring-2 ring-berry shadow-xs"
                            : "border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              isSelected
                                ? "bg-berry text-berry-foreground"
                                : "bg-muted text-muted-foreground group-hover:text-berry"
                            }`}
                          >
                            {weekdayShort}
                          </span>
                          {isSelected ? (
                            <span className="flex items-center gap-0.5 rounded-full bg-berry px-1.5 py-0.5 text-[9px] font-bold text-berry-foreground">
                              <Check className="h-2.5 w-2.5" /> Selected
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">{monthShort}</span>
                          )}
                        </div>

                        <div className="mt-2.5 flex items-baseline gap-1.5">
                          <span className="font-sans text-xl font-extrabold text-foreground leading-none">
                            {day}
                          </span>
                          <span className="font-sans text-xs font-semibold text-muted-foreground">
                            {monthShort}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Bento Time Window Card */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-berry" />
                <h2 className="font-display text-lg font-semibold">Time window</h2>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Choose your delivery arrival window
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const meta = SLOT_METADATA[slot.id] ?? {
                    icon: Clock,
                    tag: "Bakery slot",
                    period: slot.label,
                  };
                  const Icon = meta.icon;
                  const isSelected = slotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(slot.id)}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-berry bg-berry/10 text-foreground ring-2 ring-berry shadow-xs"
                          : "border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? "bg-berry text-berry-foreground"
                              : "bg-muted text-muted-foreground group-hover:text-berry"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {isSelected ? (
                          <span className="flex items-center gap-1 rounded-full bg-berry px-1.5 py-0.5 text-[9px] font-bold text-berry-foreground">
                            <Check className="h-2.5 w-2.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                            {meta.tag}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <p className="font-sans font-bold text-xs text-foreground tracking-tight">
                          {meta.period}
                        </p>
                        <p className="font-sans text-[11px] text-muted-foreground">
                          {slot.start} – {slot.end}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Separate Delivery Details and Additional Notes Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery Details Card */}
            <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-berry" />
                    <h2 className="font-display text-lg font-semibold">Delivery Details</h2>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl"
                  >
                    <Link to="/profile" search={{ returnTo: "/checkout" }}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                </div>

                {!profile?.full_name ||
                !profile?.phone ||
                (fulfilmentType === "delivery" && !profile?.address) ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Please complete your delivery details to proceed.
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-berry/40 text-berry hover:bg-berry/10"
                    >
                      <Link to="/profile" search={{ returnTo: "/checkout" }}>
                        Complete Details
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-2xl bg-muted/30 p-4 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-xs">
                        <User className="h-4 w-4 text-berry" />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Recipient</p>
                        <p className="text-sm font-semibold text-cocoa">{profile.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-xs">
                        <Phone className="h-4 w-4 text-berry" />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Phone number</p>
                        <p className="text-sm font-medium text-foreground">{profile.phone}</p>
                      </div>
                    </div>
                    {fulfilmentType === "delivery" && (
                      <div className="flex items-start gap-3 pt-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-xs">
                          <MapPin className="h-4 w-4 text-berry" />
                        </div>
                        <div className="w-full">
                          <p className="text-[11px] text-muted-foreground">Address</p>
                          <p className="whitespace-pre-wrap text-sm font-medium text-foreground leading-snug">
                            {profile.address}
                          </p>
                          {profile.latitude != null && profile.longitude != null && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-border">
                              <ClientOnly fallback={<div className="h-28 w-full bg-muted" />}>
                                <Suspense fallback={<div className="h-28 w-full bg-muted" />}>
                                  <div className="h-28">
                                    <LocationPicker
                                      latitude={profile.latitude}
                                      longitude={profile.longitude}
                                      onChange={() => {}}
                                      readonly
                                    />
                                  </div>
                                </Suspense>
                              </ClientOnly>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Additional Notes Card */}
            <section className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-berry" />
                <h2 className="font-display text-lg font-semibold">Additional Notes</h2>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Special delivery instructions, gate codes, or dietary notes (optional)
              </p>
              <div className="flex flex-1 flex-col">
                <Label htmlFor="notes" className="sr-only">
                  Notes for the bakery
                </Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Leave with reception, ring bell twice, extra napkins requested..."
                  className="min-h-[140px] flex-1 resize-none rounded-2xl border-border bg-background/50 p-3.5 text-sm transition-colors focus:bg-background focus:ring-1 focus:ring-berry"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Elevated Your order Sidebar */}
        <aside className="sticky top-24 h-fit space-y-5 rounded-3xl border border-border bg-card p-6 shadow-lift flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-berry/10 text-berry">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-cocoa leading-tight">
                    Your order
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {lines.reduce((s, l) => s + l.quantity, 0)}{" "}
                    {lines.reduce((s, l) => s + l.quantity, 0) === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground capitalize">
                {fulfilmentType}
              </span>
            </div>

            {/* Selected Slot Confirmation Pill (High-Contrast) */}
            {slotDate && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/70 border border-border p-3 text-xs shadow-2xs">
                <Calendar className="h-4 w-4 shrink-0 text-berry" />
                <div className="font-sans font-medium text-foreground">
                  <span className="font-bold text-foreground">{formatSlotDate(slotDate)}</span>
                  <span className="mx-1.5 text-muted-foreground font-normal">•</span>
                  <span className="text-muted-foreground font-medium">
                    {selectedSlot?.label.split("·")[1]?.trim() ?? selectedSlot?.label ?? slotId}
                  </span>
                </div>
              </div>
            )}

            {/* Item List with Product Thumbnails */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.productId} className="flex items-center gap-3">
                  {line.imageUrl ? (
                    <img
                      src={line.imageUrl}
                      alt={line.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover border border-border/60 bg-muted"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-secondary-foreground text-xs font-bold">
                      🥐
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.quantity} × {formatCurrency(line.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cocoa">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown (Inter Font & High Contrast) */}
            <dl className="space-y-2 border-t border-border/80 pt-4 text-sm">
              <div className="flex justify-between font-sans">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-foreground">{formatCurrency(subtotal)}</dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex items-center justify-between font-sans text-berry">
                  <dt className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Special Offers
                  </dt>
                  <dd className="font-bold">−{formatCurrency(discountTotal)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-base">
                <dt className="font-sans font-bold text-foreground">Total Amount</dt>
                <dd className="font-sans text-2xl font-extrabold text-foreground tracking-tight">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>

            {/* Freshness & Trust Guarantee */}
            <div className="rounded-2xl bg-secondary/40 p-3.5 border border-border/50">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-berry mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Bake-to-order notice:</span>{" "}
                  Everything is baked fresh on slot morning. Pay only after your slot is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* Relocated Request This Slot Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={
                busy ||
                !slotDate ||
                !profile?.full_name ||
                !profile?.phone ||
                (fulfilmentType === "delivery" && !profile?.address)
              }
              className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 py-6 text-base font-semibold shadow-soft cursor-pointer transition-all hover:scale-[1.01]"
            >
              {busy ? "Placing order…" : "Request this slot"}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}