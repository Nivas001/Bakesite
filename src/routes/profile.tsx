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
import { User, MapPin, CheckCircle2, AlertCircle, ArrowLeft, Save, Sparkles } from "lucide-react";

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
      { title: "Your details — Ani Bakes Bakery" },
      { name: "description", content: "Save your contact phone number, delivery address and map pin." },
      { property: "og:title", content: "Your details — Ani Bakes Bakery" },
      { property: "og:description", content: "Save your contact phone number, delivery address and map pin." },
    ],
  }),
  component: () => (
    <RequireAuth title="Your details">
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user } = useAuth();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/profile" });
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      });
    }
  }, [data]);

  const hasValidPhone = Boolean(form.phone && form.phone.replace(/\D/g, "").length >= 10);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!form.full_name.trim()) {
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

      await save({
        data: {
          ...form,
          phone: formattedPhone,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
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
      
      {/* Header: Compact & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-3xl font-bold text-cocoa leading-tight">
              Your details
            </h1>
            {hasValidPhone ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3" /> Saved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300">
                <AlertCircle className="size-3" /> Phone required
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Saved contact info and default doorstep delivery address
          </p>
        </div>

        {search.returnTo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: search.returnTo! })}
            className="rounded-xl text-xs font-semibold h-8 px-3 border-border"
          >
            <ArrowLeft className="mr-1 size-3" /> Back to checkout
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <div className="size-8 animate-spin rounded-full border-2 border-berry border-t-transparent" />
          <span className="text-xs font-medium">Loading details…</span>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 sm:space-y-6">
          
          {/* Main 2-Column Grid: Left Card (Contact), Right Card (Address & Map Pin) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
            
            {/* Card 1: Contact Information */}
            <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3.5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-secondary text-berry">
                  <User className="size-4" />
                </div>
                <h2 className="font-display text-sm sm:text-base font-bold text-cocoa">
                  Contact Information
                </h2>
              </div>

              <div className="space-y-1">
                <Label htmlFor="full_name" className="text-[11px] sm:text-xs font-semibold">
                  Full name <span className="text-berry">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                  required
                  className="rounded-xl h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[11px] sm:text-xs font-semibold">
                  Mobile phone number <span className="text-berry">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  required
                  className="rounded-xl h-9 sm:h-10 text-xs sm:text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Used by our delivery riders and bakers for slot arrival.
                </p>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-email" className="text-[11px] sm:text-xs font-semibold">
                    Email address
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-medium">Account ID</span>
                </div>
                <Input
                  id="profile-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className="rounded-xl h-9 sm:h-10 text-xs sm:text-sm bg-muted/50 text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Card 2: Default Delivery Address & Map Pin */}
            <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-secondary text-berry">
                    <MapPin className="size-4" />
                  </div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-cocoa">
                    Delivery Location
                  </h2>
                </div>
                {form.latitude != null && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Pin set
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-[11px] sm:text-xs font-semibold">
                  Default delivery address
                </Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Apartment/House No, Building, Street, Area, Landmark"
                  className="rounded-xl text-xs sm:text-sm min-h-[58px]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] sm:text-xs font-semibold">
                    Delivery map pin
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Tap map to set</span>
                </div>
                
                <ClientOnly fallback={<div className="h-40 sm:h-48 w-full rounded-xl bg-muted animate-pulse" />}>
                  <Suspense fallback={<div className="h-40 sm:h-48 w-full rounded-xl bg-muted animate-pulse" />}>
                    <LocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onChange={(latitude, longitude) => setForm((f) => ({ ...f, latitude, longitude }))}
                      className="h-40 sm:h-48 rounded-xl"
                    />
                  </Suspense>
                </ClientOnly>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={busy}
              size="default"
              className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs sm:text-sm px-7 h-10 shadow-soft cursor-pointer"
            >
              <Save className="mr-1.5 size-4" />
              {busy ? "Saving…" : "Save details"}
            </Button>
          </div>

        </form>
      )}

    </div>
  );
}