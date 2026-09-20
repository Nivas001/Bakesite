import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { toast } from "sonner";
import { getBlackoutDates } from "@/lib/catalog.functions";
import { getMyProfile, placeOrder } from "@/lib/orders.functions";
import { checkOfferCode } from "@/lib/offers.functions";
import { RequireAuth } from "@/components/require-auth";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/pricing";
import {
  TIME_SLOTS,
  formatSlotDate,
  selectableDates,
  getAvailableSlotsForDate,
  isSlotAvailable,
} from "@/lib/slots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tag,
  Truck,
  Store,
} from "lucide-react";
import { LazyVideo } from "@/components/motion/lazy-video";

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
      { title: "Checkout — Aniii Bakes Bakery" },
      { name: "description", content: "Pick a next-day delivery or pickup slot for your bakes." },
      { property: "og:title", content: "Checkout — Aniii Bakes Bakery" },
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
  const validatePromoFn = useServerFn(checkOfferCode);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: blackout } = useQuery({ queryKey: ["blackout"], queryFn: () => fetchBlackout() });

  const [fulfilmentType, setFulfilmentType] = useState<"delivery" | "pickup">("delivery");
  const [slotDate, setSlotDate] = useState("");
  const [slotId, setSlotId] = useState(TIME_SLOTS[0]!.id);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountType: "percent" | "flat";
    discountValue: number;
    description?: string | null;
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  // Bound to the field with aria-describedby rather than shown only as a
  // toast, which vanishes before it can be read and is never associated with
  // the input that caused it.
  const [promoError, setPromoError] = useState<string | null>(null);

  // Alternate delivery contact state
  const [useAlternateContact, setUseAlternateContact] = useState(false);
  const [alternateName, setAlternateName] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");

  const dates = selectableDates(
    (blackout ?? []).map((b) => b.blackout_date),
    5,
  );

  useEffect(() => {
    if (dates.length > 0 && (!slotDate || !dates.includes(slotDate))) {
      setSlotDate(dates[0]!);
    }
  }, [dates, slotDate]);

  useEffect(() => {
    if (slotDate) {
      const available = getAvailableSlotsForDate(slotDate, 24);
      if (available.length > 0 && !available.some((s) => s.id === slotId)) {
        setSlotId(available[0]!.id);
      }
    }
  }, [slotDate, slotId]);

  const hasValidPhone = Boolean(profile?.phone && profile.phone.replace(/\D/g, "").length >= 10);
  const hasFullName = Boolean(profile?.full_name && profile.full_name.trim().length >= 2);
  const isProfileReady = hasValidPhone && hasFullName;

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

  async function handleApplyPromo() {
    if (!promoCodeInput.trim()) {
      setPromoError("Please enter an offer code.");
      return;
    }
    setPromoError(null);
    setValidatingPromo(true);
    try {
      const res = await validatePromoFn({
        data: {
          code: promoCodeInput.trim().toUpperCase(),
          subtotal: total,
        },
      });
      setAppliedPromo(res);
      toast.success(
        `Offer code "${res.code}" applied! Saved ${formatCurrency(res.discountAmount)}`,
      );
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : "That offer code is not valid.");
    } finally {
      setValidatingPromo(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCodeInput("");
    toast.info("Offer code removed");
  }

  const promoDiscount = appliedPromo ? Math.min(total, appliedPromo.discountAmount) : 0;
  const finalTotal = Math.max(0, total - promoDiscount);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    if (!profile || !isProfileReady) {
      toast.error("Please add your contact phone number in your profile before placing an order.");
      navigate({ to: "/profile", search: { returnTo: "/checkout" } });
      setBusy(false);
      return;
    }

    if (useAlternateContact && alternatePhone.trim().replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit alternate contact phone number.");
      setBusy(false);
      return;
    }

    const finalContactName =
      useAlternateContact && alternateName.trim() ? alternateName.trim() : profile.full_name;
    const finalContactPhone =
      useAlternateContact && alternatePhone.trim() ? alternatePhone.trim() : profile.phone;

    const currentSelectedSlot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!currentSelectedSlot || !isSlotAvailable(slotDate, currentSelectedSlot.start, 24)) {
      toast.error(
        "Small-batch baking requires at least 24 hours advance notice. Please select an available slot.",
      );
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
          contactName: finalContactName,
          contactPhone: finalContactPhone,
          address: fulfilmentType === "delivery" ? profile.address : "",
          latitude: fulfilmentType === "delivery" ? profile.latitude : null,
          longitude: fulfilmentType === "delivery" ? profile.longitude : null,
          notes: notes || undefined,
          promoCode: appliedPromo?.code,
          promoDiscount,
        },
      });
      clear();
      toast.success("Order placed. We will confirm your slot and send a payment link.");
      navigate({ to: "/orders" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  const selectedSlot = TIME_SLOTS.find((s) => s.id === slotId);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  /** Whether each checklist entry across the top of the page is satisfied. */
  const needsAddress = fulfilmentType === "delivery" && !profile?.address;
  const stepDone: Record<(typeof CHECKOUT_STEPS)[number]["id"], boolean> = {
    fulfilment: true,
    date: Boolean(slotDate),
    contact: isProfileReady && !needsAddress,
    review: Boolean(slotDate) && isProfileReady && !needsAddress,
  };
  // The submit button and the checklist read the same condition, so the page
  // can never show four ticks beside a disabled button.
  const canSubmit = !busy && stepDone.review;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 shadow-soft sm:rounded-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-berry/12 blur-3xl"
        />
        <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/30 bg-berry/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-berry-deep uppercase">
              <Sparkles className="size-3.5" />
              One day of notice
            </span>
            <h1 className="mt-2 font-blogh text-[clamp(1.55rem,5vw,2.75rem)] leading-[1.05] font-bold tracking-wide text-cocoa uppercase">
              Choose your slot &amp; checkout
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              You are not charged now. We check the morning oven has room, then send a secure
              payment link.
            </p>
          </div>

          {/* The one number that matters, repeated here so it is visible before
              the sidebar scrolls into reach on a phone. */}
          <div className="shrink-0 rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 text-center shadow-2xs sm:text-right">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              Order total
            </p>
            <p className="font-blogh text-2xl font-bold text-cocoa tabular-nums sm:text-3xl dark:text-foreground">
              {formatCurrency(finalTotal)}
            </p>
          </div>
        </div>

        {/* A completion checklist rather than a wizard: the form is one page,
            and this says what still has to be filled in before it can be
            submitted. Each step scrolls to the card it is about. */}
        <ol
          aria-label="Checkout progress"
          className="relative z-10 grid grid-cols-2 divide-border/60 border-t border-dashed border-border/70 bg-card/65 backdrop-blur-sm sm:grid-cols-4 sm:divide-x"
        >
          {CHECKOUT_STEPS.map((step, index) => {
            const done = stepDone[step.id];
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => scrollToStep(step.id)}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-secondary/40"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                      done ? "bg-emerald-600 text-white" : "bg-secondary text-cocoa"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : index + 1}
                  </span>
                  <span
                    className={`truncate text-[11px] font-bold sm:text-xs ${
                      done ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      <form onSubmit={submit} className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-7">
        <div className="space-y-5">
          {/* ── 1. Delivery or pickup ──────────────────────────────── */}
          <StepCard
            id="fulfilment"
            index={1}
            icon={Truck}
            title="Delivery or pickup"
            subtitle="How you want to receive your bakes"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: "delivery" as const,
                  icon: Truck,
                  label: "Delivery",
                  blurb: "Rider brings it to your door",
                },
                {
                  id: "pickup" as const,
                  icon: Store,
                  label: "Pickup",
                  blurb: "Collect it from the counter",
                },
              ].map((option) => {
                const Icon = option.icon;
                const selected = fulfilmentType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFulfilmentType(option.id)}
                    aria-pressed={selected}
                    className={`relative cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${
                      selected
                        ? "border-berry bg-berry/10 shadow-xs ring-2 ring-berry"
                        : "border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                    }`}
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-xl transition-colors ${
                        selected ? "bg-berry text-berry-foreground" : "bg-secondary text-cocoa"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <p className="mt-2 font-sans text-sm font-bold text-foreground">
                      {option.label}
                    </p>
                    <p className="text-[11px] leading-snug text-muted-foreground">{option.blurb}</p>
                    {selected && (
                      <Check className="absolute top-3 right-3 size-4 text-berry-deep" />
                    )}
                  </button>
                );
              })}
            </div>
          </StepCard>

          {/* ── 2. Date ────────────────────────────────────────────── */}
          <StepCard
            id="date"
            index={2}
            icon={Calendar}
            title="Dispatch date"
            subtitle="Small-batch baking needs 24 hours of notice"
            aside={slotDate ? formatSlotDate(slotDate) : undefined}
          >
            {dates.length === 0 ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                No available baking slots in the next few days.
              </p>
            ) : (
              /* A single rail of equal day cards. The old grid gave the first
                 date a full-width row of its own, which made the earliest slot
                 look like a different kind of thing from the rest. */
              <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {dates.map((date, index) => {
                  const isSelected = slotDate === date;
                  const { weekdayShort, weekdayLong, day, monthShort } = parseDateParts(date);
                  return (
                    <li key={date} className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setSlotDate(date)}
                        aria-pressed={isSelected}
                        aria-label={`${weekdayLong}, ${day} ${monthShort}`}
                        className={`group flex w-full min-w-[4.5rem] cursor-pointer flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 transition-all ${
                          isSelected
                            ? "border-berry bg-berry/10 shadow-xs ring-2 ring-berry"
                            : "border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] font-bold tracking-wider uppercase ${
                            isSelected ? "text-berry-deep" : "text-muted-foreground"
                          }`}
                        >
                          {weekdayShort}
                        </span>
                        <span className="font-sans text-xl leading-none font-extrabold text-foreground">
                          {day}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {monthShort}
                        </span>
                        {index === 0 && (
                          <span
                            className={`mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                              isSelected
                                ? "bg-berry text-berry-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            Earliest
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </StepCard>

          {/* ── 3. Time window ─────────────────────────────────────── */}
          <StepCard
            id="slot"
            index={3}
            icon={Clock}
            title="Time window"
            subtitle={`Your preferred ${fulfilmentType} window`}
            aside={selectedSlot?.label.split("·")[1]?.trim()}
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {TIME_SLOTS.map((s) => {
                const isSelected = slotId === s.id;
                const available = slotDate ? isSlotAvailable(slotDate, s.start, 24) : true;
                const meta = SLOT_METADATA[s.id] ?? {
                  icon: Clock,
                  tag: "Available",
                  period: "Slot",
                };
                const Icon = meta.icon;

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!available}
                    onClick={() => setSlotId(s.id)}
                    aria-pressed={isSelected}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      !available
                        ? "cursor-not-allowed border-border/40 bg-muted/20 opacity-45"
                        : isSelected
                          ? "cursor-pointer border-berry bg-berry/10 shadow-xs ring-2 ring-berry"
                          : "cursor-pointer border-border bg-background/50 hover:border-berry/40 hover:bg-card"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-berry text-berry-foreground"
                          : "bg-secondary text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-sans text-xs font-bold text-foreground">
                          {s.label.split("·")[0]?.trim()}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-muted-foreground">
                          {s.label.split("·")[1]?.trim()}
                        </span>
                      </span>
                      <span className="block text-[11px] text-muted-foreground">{meta.tag}</span>
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-berry-deep" />
                    ) : !available ? (
                      <span className="shrink-0 text-[11px] font-medium text-destructive">
                        Closed
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </StepCard>

          {/* ── 4. Contact & delivery ──────────────────────────────── */}
          <StepCard
            id="contact"
            index={4}
            icon={User}
            title="Contact &amp; delivery"
            subtitle="Who the rider calls, and where they go"
            action={
              profile ? (
                <Link
                  to="/profile"
                  search={{ returnTo: "/checkout" }}
                  className="flex items-center gap-1 text-xs font-semibold text-berry-deep hover:underline"
                >
                  <Pencil className="size-3" /> Edit in profile
                </Link>
              ) : null
            }
          >
            {!profile || !isProfileReady ? (
              <div className="space-y-3 rounded-2xl border border-dashed border-berry/40 bg-berry/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {!hasValidPhone
                    ? "A phone number is required so our delivery partner can coordinate your drop-off."
                    : "Please complete your delivery address and name in your profile."}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-berry font-semibold text-berry-foreground hover:bg-berry/90"
                >
                  <Link to="/profile" search={{ returnTo: "/checkout" }}>
                    {!hasValidPhone ? "Add phone in profile" : "Complete details"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <DetailTile icon={User} label="Account name" value={profile.full_name} />
                  <DetailTile icon={Phone} label="Contact phone" value={profile.phone} />
                </div>

                {fulfilmentType === "delivery" && (
                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-berry-deep shadow-xs">
                        <MapPin className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] text-muted-foreground">Delivery address</p>
                          <Link
                            to="/profile"
                            search={{ returnTo: "/checkout" }}
                            className="text-[11px] font-semibold text-berry-deep hover:underline"
                          >
                            Edit
                          </Link>
                        </div>
                        <p className="mt-0.5 text-sm leading-snug font-medium whitespace-pre-wrap text-foreground">
                          {profile.address}
                        </p>

                        {profile.latitude != null && profile.longitude != null ? (
                          <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1 font-semibold text-cocoa dark:text-foreground">
                                <MapPin className="size-3 text-berry-deep" /> Doorstep GPS pin set
                              </span>
                              <Link
                                to="/profile"
                                search={{ returnTo: "/checkout" }}
                                className="font-semibold text-berry-deep hover:underline"
                              >
                                Adjust pin →
                              </Link>
                            </div>
                            <ClientOnly
                              fallback={<div className="h-28 w-full rounded-2xl bg-muted" />}
                            >
                              <Suspense
                                fallback={<div className="h-28 w-full rounded-2xl bg-muted" />}
                              >
                                <LocationPicker
                                  latitude={profile.latitude}
                                  longitude={profile.longitude}
                                  readonly
                                  onChange={() => {}}
                                  className="h-28"
                                />
                              </Suspense>
                            </ClientOnly>
                          </div>
                        ) : (
                          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-berry/30 bg-berry/5 p-2.5">
                            <span className="text-[11px] text-muted-foreground">
                              📍 Add a doorstep GPS pin for effortless rider delivery
                            </span>
                            <Link
                              to="/profile"
                              search={{ returnTo: "/checkout" }}
                              className="shrink-0 text-[11px] font-bold text-berry-deep hover:underline"
                            >
                              Pin on map →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternate contact */}
                <div className="rounded-2xl border border-border/70 bg-card p-3.5">
                  <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-foreground select-none">
                    <input
                      type="checkbox"
                      checked={useAlternateContact}
                      onChange={(e) => setUseAlternateContact(e.target.checked)}
                      className="size-4 rounded border-input text-berry-deep focus:ring-berry"
                    />
                    <span>Deliver to someone else, or use another number</span>
                  </label>

                  {useAlternateContact && (
                    <div className="mt-3 grid animate-in gap-3 border-t border-border/50 pt-3 duration-200 fade-in sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label
                          htmlFor="alt-name"
                          className="text-[11px] font-semibold text-muted-foreground"
                        >
                          Recipient name
                        </Label>
                        <Input
                          id="alt-name"
                          placeholder="e.g. Rahul / Security gate"
                          value={alternateName}
                          onChange={(e) => setAlternateName(e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor="alt-phone"
                          className="text-[11px] font-semibold text-muted-foreground"
                        >
                          Recipient phone
                        </Label>
                        <Input
                          id="alt-phone"
                          type="tel"
                          inputMode="tel"
                          placeholder="10-digit mobile number"
                          value={alternatePhone}
                          onChange={(e) => setAlternatePhone(e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          The rider will call this number on arrival.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </StepCard>

          {/* ── 5. Notes ───────────────────────────────────────────── */}
          <StepCard
            id="notes"
            index={5}
            icon={Sparkles}
            title="Baker &amp; delivery notes"
            subtitle="Slice preferences, gate codes, gift boxes — all optional"
            aside={notes.trim() ? `${notes.trim().length} chars` : undefined}
          >
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {NOTE_CHIPS.map((chip) => {
                const clean = chip.replace(/^[^\s]+\s/, "");
                const used = notes.includes(clean);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() =>
                      setNotes((prev) => {
                        if (prev.includes(clean)) {
                          // Tapping an applied chip takes it back off, which the
                          // previous version had no way of doing short of
                          // editing the sentence by hand.
                          return prev
                            .split(" · ")
                            .filter((part) => part !== clean)
                            .join(" · ");
                        }
                        return prev ? `${prev} · ${clean}` : clean;
                      })
                    }
                    aria-pressed={used}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      used
                        ? "border-berry bg-berry/15 text-berry-deep"
                        : "border-border/70 bg-secondary/50 text-foreground hover:border-berry/40 hover:bg-berry/10"
                    }`}
                  >
                    {used ? "✓" : "+"} {chip}
                  </button>
                );
              })}
            </div>

            <Label htmlFor="notes" className="sr-only">
              Notes for the bakery
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Leave with reception, ring bell twice, extra napkins requested…"
              className="min-h-[96px] resize-none rounded-2xl border-border bg-background/50 p-3.5 text-sm transition-colors focus:bg-background focus:ring-1 focus:ring-berry"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </StepCard>
        </div>

        {/* ── Order summary ──────────────────────────────────────────── */}
        {/* A docket: header, the slot, the lines, the arithmetic, then the
            button. Sticky only from lg, because below that it is simply the
            last thing on the page and sticking it to the top of a phone
            viewport pinned it over the form. */}
        <aside
          id="checkout-summary"
          className="h-fit scroll-mt-24 space-y-0 overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/80 p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-2xl bg-berry/10 text-berry-deep">
                <ShoppingBag className="size-5" />
              </span>
              <div>
                <h2 className="font-blogh text-base leading-tight font-bold tracking-wide text-cocoa uppercase dark:text-foreground">
                  Your order
                </h2>
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground capitalize">
              {fulfilmentType}
            </span>
          </div>

          <div className="space-y-4 p-5">
            {/* Selected slot */}
            {slotDate && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-muted/70 p-3 text-xs shadow-2xs">
                <Calendar className="size-4 shrink-0 text-berry-deep" />
                <p className="font-sans font-medium text-foreground">
                  <span className="font-bold">{formatSlotDate(slotDate)}</span>
                  <span className="mx-1.5 font-normal text-muted-foreground">•</span>
                  <span className="font-medium text-muted-foreground">
                    {selectedSlot?.label.split("·")[1]?.trim() ?? selectedSlot?.label ?? slotId}
                  </span>
                </p>
              </div>
            )}

            {/* Lines */}
            <ul className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-3">
                  {line.imageUrl ? (
                    <img
                      src={line.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-12 shrink-0 rounded-xl border border-border/60 bg-muted object-cover"
                    />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary/60 text-xs font-bold text-secondary-foreground">
                      🥐
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa dark:text-foreground">
                      {line.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {line.quantity} × {formatCurrency(line.unitPrice)}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-cocoa tabular-nums dark:text-foreground">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-xl border-dashed border-border py-4 text-xs font-semibold text-muted-foreground hover:border-berry/40 hover:bg-secondary/40 hover:text-foreground"
            >
              <Link to="/cart">
                <Pencil className="mr-1.5 size-3.5 text-berry-deep" />
                Edit items or add more bakes
              </Link>
            </Button>

            {/* Offer code — moved into the summary, beside the number it
                changes. It used to sit at the top of the form, far from the
                total, so its effect was invisible when it was applied. */}
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Tag className="size-3.5 text-berry-deep" />
                <h3 className="text-xs font-bold text-foreground">Have an offer code?</h3>
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
                      <Check className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-bold text-cocoa dark:text-foreground">
                        {appliedPromo.code}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {appliedPromo.discountType === "percent"
                          ? `${appliedPromo.discountValue}% off applied`
                          : `₹${appliedPromo.discountValue} off applied`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePromo}
                    className="h-7 shrink-0 rounded-lg text-xs text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      placeholder="e.g. WELCOME10"
                      value={promoCodeInput}
                      aria-invalid={promoError ? true : undefined}
                      aria-describedby={promoError ? "promo-code-error" : undefined}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      className={`h-9 rounded-xl bg-background/60 font-mono text-xs tracking-wider uppercase focus:bg-background ${
                        promoError ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      disabled={validatingPromo || !promoCodeInput.trim()}
                      onClick={handleApplyPromo}
                      className="h-9 shrink-0 rounded-xl bg-berry px-4 text-xs font-semibold text-berry-foreground hover:bg-berry/90"
                    >
                      {validatingPromo ? "Checking…" : "Apply"}
                    </Button>
                  </div>
                  {promoError && (
                    <p
                      id="promo-code-error"
                      role="alert"
                      className="text-[11px] font-semibold text-destructive"
                    >
                      {promoError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Arithmetic */}
            <dl className="space-y-2 border-t border-border/80 pt-4 text-sm">
              <div className="flex justify-between font-sans">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono font-semibold text-foreground tabular-nums">
                  {formatCurrency(subtotal)}
                </dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex items-center justify-between font-sans text-berry-deep">
                  <dt className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="size-3.5" />
                    Special offers
                  </dt>
                  <dd className="font-mono font-bold tabular-nums">
                    −{formatCurrency(discountTotal)}
                  </dd>
                </div>
              )}
              {appliedPromo && promoDiscount > 0 && (
                <div className="flex items-center justify-between font-sans text-emerald-600 dark:text-emerald-400">
                  <dt className="flex items-center gap-1.5 font-medium">
                    <Tag className="size-3.5" />
                    Promo ({appliedPromo.code})
                  </dt>
                  <dd className="font-mono font-bold tabular-nums">
                    −{formatCurrency(promoDiscount)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <dt className="font-sans font-bold text-foreground">Total amount</dt>
                <dd className="font-mono text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(finalTotal)}
                </dd>
              </div>
            </dl>

            {/* Trust */}
            <div className="space-y-2.5 rounded-2xl border border-border/50 bg-secondary/40 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center">
                  <LazyVideo
                    src="/illustration/3d-stickle-credit-card-terminal-pay"
                    className="pointer-events-none size-full object-contain drop-shadow-sm"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-cocoa dark:text-foreground">
                    Instant encrypted payment
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Secures your morning oven slot
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-border/40 pt-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Bake-to-order notice:</span>{" "}
                  Everything is baked fresh at 4:00&nbsp;AM on your delivery date.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 bg-secondary/25 p-5">
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="w-full cursor-pointer rounded-2xl bg-berry py-6 text-base font-semibold text-berry-foreground shadow-soft transition-all hover:scale-[1.01] hover:bg-berry/90 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {busy ? "Placing your order…" : `Request this slot · ${formatCurrency(finalTotal)}`}
            </Button>
            {/* Says why the button is off, rather than leaving a dead control. */}
            {!busy && !canSubmit && (
              <p className="mt-2 text-center text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                {!slotDate
                  ? "Pick a dispatch date to continue."
                  : !isProfileReady
                    ? "Add your name and phone number to continue."
                    : "Add a delivery address to continue."}
              </p>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}

/** The checklist across the top of the page, and the cards each entry scrolls to. */
const CHECKOUT_STEPS = [
  { id: "fulfilment", label: "Delivery or pickup" },
  { id: "date", label: "Date & time slot" },
  { id: "contact", label: "Contact details" },
  { id: "review", label: "Review & confirm" },
] as const;

const NOTE_CHIPS = [
  "🎂 Write Happy Birthday on box",
  "🥖 Please slice the loaf",
  "🔔 Ring bell on arrival",
  "🚪 Leave at security / door",
  "🎁 Gift packing requested",
];

function scrollToStep(id: string) {
  // "Review & confirm" is the summary column rather than a numbered card.
  const target = id === "review" ? "checkout-summary" : `checkout-step-${id}`;
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** One numbered section of the checkout form. */
function StepCard({
  id,
  index,
  icon: Icon,
  title,
  subtitle,
  aside,
  action,
  children,
}: {
  id: string;
  index: number;
  icon: typeof User;
  title: string;
  subtitle: string;
  aside?: string | undefined;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`checkout-step-${id}`}
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5"
    >
      <div className="mb-3.5 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-berry-deep">
            <Icon className="size-4" />
            <span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-cocoa text-[9px] font-black text-background">
              {index}
            </span>
          </span>
          <div className="min-w-0">
            <h2 className="font-sans text-sm font-bold text-foreground sm:text-base">{title}</h2>
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action ??
          (aside ? (
            <span className="max-w-[45%] shrink-0 truncate rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-bold text-cocoa dark:text-foreground">
              {aside}
            </span>
          ) : null)}
      </div>
      {children}
    </section>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-berry-deep shadow-xs">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-cocoa dark:text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
