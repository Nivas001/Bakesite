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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LocationPicker = lazy(() => import("@/components/location-picker"));

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
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const dates = selectableDates((blackout ?? []).map((b) => b.blackout_date));

  useEffect(() => {
    if (!slotDate && dates.length > 0) setSlotDate(dates[0]!);
  }, [dates, slotDate]);

  useEffect(() => {
    if (!profile) return;
    setContactName((v) => v || profile.full_name || "");
    setContactPhone((v) => v || profile.phone || "");
    setAddress((v) => v || profile.address || "");
    setLatitude((v) => v ?? profile.latitude ?? null);
    setLongitude((v) => v ?? profile.longitude ?? null);
  }, [profile]);

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
    try {
      await submitOrder({
        data: {
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          slotDate,
          slotId,
          fulfilmentType,
          contactName,
          contactPhone,
          address: fulfilmentType === "delivery" ? address : "",
          latitude: fulfilmentType === "delivery" ? latitude : null,
          longitude: fulfilmentType === "delivery" ? longitude : null,
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

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_320px]">
      <form className="space-y-8" onSubmit={submit}>
        <div>
          <h1 className="font-display text-3xl font-bold text-cocoa">Choose your slot</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders need one day of notice. We confirm availability before asking for payment.
          </p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Delivery or pickup</h2>
          <div className="mt-4 flex gap-2">
            {(["delivery", "pickup"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={fulfilmentType === option ? "default" : "outline"}
                onClick={() => setFulfilmentType(option)}
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Date</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dates.map((date) => (
              <Button
                key={date}
                type="button"
                size="sm"
                variant={slotDate === date ? "default" : "outline"}
                onClick={() => setSlotDate(date)}
              >
                {formatSlotDate(date)}
              </Button>
            ))}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold">Time window</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {TIME_SLOTS.map((slot) => (
              <Button
                key={slot.id}
                type="button"
                variant={slotId === slot.id ? "default" : "outline"}
                onClick={() => setSlotId(slot.id)}
                className="justify-start"
              >
                {slot.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <div>
            <Label htmlFor="contactName">Full name</Label>
            <Input id="contactName" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone</Label>
            <Input id="contactPhone" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>

          {fulfilmentType === "delivery" && (
            <>
              <div>
                <Label htmlFor="address">Delivery address</Label>
                <Textarea id="address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label>Map pin</Label>
                <p className="mb-2 text-xs text-muted-foreground">Tap the map to mark your door.</p>
                <ClientOnly fallback={<div className="h-64 w-full rounded-2xl bg-muted" />}>
                  <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted" />}>
                    <LocationPicker
                      latitude={latitude}
                      longitude={longitude}
                      onChange={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                    />
                  </Suspense>
                </ClientOnly>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="notes">Notes for the bakery</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </section>

        <Button type="submit" size="lg" disabled={busy || !slotDate} className="bg-berry text-berry-foreground hover:bg-berry/90">
          {busy ? "Placing order…" : "Request this slot"}
        </Button>
      </form>

      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Your order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {line.quantity} × {line.name}
              </span>
              <span>{formatCurrency(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-berry">
              <dt>Offers</dt>
              <dd>−{formatCurrency(discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          No payment now. Once the bakery approves your slot you&apos;ll receive a payment link.
        </p>
      </aside>
    </div>
  );
}