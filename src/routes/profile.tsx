import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMyProfile, saveMyProfile } from "@/lib/orders.functions";
import { useAuth } from "@/hooks/use-appwrite-auth";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Home,
  Crosshair,
} from "lucide-react";

const LocationPicker = lazy(() => import("@/components/location-picker"));

export const Route = createFileRoute("/profile")({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string | undefined } => {
    const returnTo = search["returnTo"];
    return {
      returnTo: typeof returnTo === "string" ? returnTo : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Your details — Aniii Bakes Bakery" },
      {
        name: "description",
        content: "Save your contact phone number, delivery address and map pin.",
      },
      { property: "og:title", content: "Your details — Aniii Bakes Bakery" },
      {
        property: "og:description",
        content: "Save your contact phone number, delivery address and map pin.",
      },
    ],
  }),
  component: () => (
    <RequireAuth title="Your details">
      <ProfilePage />
    </RequireAuth>
  ),
});

/**
 * The saved-details page.
 *
 * Rebuilt around a completeness meter. Two equal cards gave no sense of what
 * was still missing or why it mattered — a delivery rider needs a phone number
 * and a pin, and the page now says so, counts what is filled in, and only
 * enables the save button once something has actually changed.
 */
function ProfilePage() {
  const { user } = useAuth();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/profile" });
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const empty = {
    full_name: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  };

  const [form, setForm] = useState(empty);
  /** The last saved shape, so the page can tell whether anything has changed. */
  const [saved, setSaved] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next = {
      full_name: data.full_name ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };
    setForm(next);
    setSaved(next);
  }, [data]);

  const hasValidPhone = Boolean(form.phone && form.phone.replace(/\D/g, "").length >= 10);
  const hasName = Boolean(form.full_name.trim());
  const hasAddress = Boolean(form.address.trim());
  const hasPin = form.latitude != null && form.longitude != null;

  const checklist = [
    { id: "name", label: "Name", done: hasName, required: true },
    { id: "phone", label: "Phone", done: hasValidPhone, required: true },
    { id: "address", label: "Address", done: hasAddress, required: false },
    { id: "pin", label: "Map pin", done: hasPin, required: false },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const ready = hasName && hasValidPhone;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!hasName) {
      toast.error("Please enter your full name.");
      return;
    }
    const cleanPhoneDigits = form.phone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10) {
      toast.error("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    setBusy(true);
    try {
      const formattedPhone = form.phone.startsWith("+")
        ? form.phone.trim()
        : `+91${cleanPhoneDigits.slice(-10)}`;

      const next = { ...form, phone: formattedPhone };
      await save({ data: next });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setForm(next);
      setSaved(next);
      toast.success("Profile details saved successfully!");
      if (search.returnTo) {
        navigate({ to: search.returnTo });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your details");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:py-8">
      {/* ── Header with a completeness meter ───────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 shadow-soft sm:rounded-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-berry/12 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-blogh text-[clamp(1.5rem,5vw,2.5rem)] leading-tight font-bold tracking-wide text-cocoa uppercase">
                Your details
              </h1>
              {ready ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 sm:text-xs dark:text-emerald-300">
                  <CheckCircle2 className="size-3" /> Ready to order
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 sm:text-xs dark:text-amber-300">
                  <AlertCircle className="size-3" /> Phone required
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Saved once, reused at every checkout — our riders and bakers work from exactly this.
            </p>
          </div>

          {search.returnTo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: search.returnTo! })}
              className="h-9 w-fit shrink-0 cursor-pointer rounded-full border-border px-3.5 text-xs font-bold"
            >
              <ArrowLeft className="mr-1 size-3" /> Back to checkout
            </Button>
          )}
        </div>

        {/* The meter: what is filled in, and what is still missing. */}
        <div className="relative z-10 border-t border-dashed border-border/70 bg-card/65 px-5 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              Profile completeness
            </span>
            <span className="font-mono text-xs font-bold text-cocoa tabular-nums dark:text-foreground">
              {completed} / {checklist.length}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-linear-to-r from-berry to-amber-400 transition-[width] duration-500"
              style={{ width: `${(completed / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {checklist.map((item) => (
              <li key={item.id}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    item.done
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : item.required
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-border/70 bg-secondary/50 text-muted-foreground",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                  {item.label}
                  {!item.done && !item.required && (
                    <span className="font-normal opacity-70">· optional</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-2 border-berry border-t-transparent" />
          <span className="text-xs font-medium">Loading details…</span>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2">
            {/* ── Contact ──────────────────────────────────────────── */}
            <FieldCard
              icon={User}
              title="Contact information"
              subtitle="Who we call when your bakes arrive"
            >
              <Field
                id="full_name"
                label="Full name"
                required
                done={hasName}
                icon={User}
                hint="The name we write on the box."
              >
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  className="h-10 rounded-xl text-sm"
                />
              </Field>

              <Field
                id="phone"
                label="Mobile phone number"
                required
                done={hasValidPhone}
                icon={Phone}
                hint="Used by our delivery riders and bakers for slot arrival."
              >
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  required
                  autoComplete="tel"
                  aria-invalid={form.phone.length > 0 && !hasValidPhone ? true : undefined}
                  className="h-10 rounded-xl text-sm"
                />
              </Field>

              {/* Read-only, and said so plainly rather than as a disabled box
                  that looks like a field somebody forgot to fill in. */}
              <div className="rounded-xl border border-border/60 bg-secondary/35 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <Mail className="size-3.5 text-berry-deep" />
                    Email address
                  </span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Account ID
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-cocoa dark:text-foreground">
                  {user?.email || "—"}
                </p>
              </div>
            </FieldCard>

            {/* ── Delivery ─────────────────────────────────────────── */}
            <FieldCard
              icon={MapPin}
              title="Delivery location"
              subtitle="Where the rider is headed"
              badge={
                hasPin ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Pin set
                  </span>
                ) : null
              }
            >
              <Field
                id="address"
                label="Default delivery address"
                done={hasAddress}
                icon={Home}
                hint="Flat or house number, street, area and a landmark."
              >
                <Textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Apartment/House No, Building, Street, Area, Landmark"
                  autoComplete="street-address"
                  className="min-h-[72px] rounded-xl text-sm"
                />
              </Field>

              <Field
                id="map"
                label="Delivery map pin"
                done={hasPin}
                icon={Crosshair}
                hint="Tap the map to drop a pin. It saves the rider a phone call."
              >
                {/* LocationPicker draws its own rounded border, so this is
                    deliberately an unstyled wrapper — nesting a second one
                    produced a visible double outline. */}
                <ClientOnly
                  fallback={
                    <div className="h-44 w-full animate-pulse rounded-2xl bg-muted sm:h-52" />
                  }
                >
                  <Suspense
                    fallback={
                      <div className="h-44 w-full animate-pulse rounded-2xl bg-muted sm:h-52" />
                    }
                  >
                    <LocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onChange={(latitude, longitude) =>
                        setForm((f) => ({ ...f, latitude, longitude }))
                      }
                      className="h-44 sm:h-52"
                    />
                  </Suspense>
                </ClientOnly>
              </Field>
            </FieldCard>
          </div>

          {/* ── Save bar ───────────────────────────────────────────── */}
          {/* Docked to the bottom of the viewport on phones, where the map
              pushes the button far below the fold. */}
          <div className="sticky bottom-0 z-20 -mx-4 flex flex-col items-center gap-3 border-t border-border/70 bg-background/92 px-4 py-3 backdrop-blur-md sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:px-4">
            <p className="flex-1 text-center text-[11px] text-muted-foreground sm:text-left">
              {dirty
                ? "You have unsaved changes."
                : ready
                  ? "Everything we need is saved."
                  : "Add a name and phone number to place an order."}
            </p>
            <Button
              type="submit"
              disabled={busy || !dirty}
              size="default"
              className="h-10 w-full cursor-pointer rounded-xl bg-berry px-7 text-sm font-bold text-berry-foreground shadow-soft hover:bg-berry/90 disabled:cursor-not-allowed sm:w-auto sm:rounded-2xl"
            >
              <Save className="mr-1.5 size-4" />
              {busy ? "Saving…" : dirty ? "Save details" : "Saved"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function FieldCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: typeof User;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-secondary text-berry-deep">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-sans text-sm font-bold text-cocoa dark:text-foreground">{title}</h2>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

/**
 * One labelled control, with a tick once it holds something usable.
 *
 * The tick is what turns the form from "four boxes" into visible progress, and
 * it mirrors the meter in the header without the two being able to disagree —
 * both read the same booleans.
 */
function Field({
  id,
  label,
  hint,
  required = false,
  done,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  done: boolean;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-bold sm:text-xs">
          <Icon className="size-3.5 text-muted-foreground" />
          {label}
          {required && <span className="text-berry-deep">*</span>}
        </Label>
        {done && (
          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}
