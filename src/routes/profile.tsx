import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMyProfile, saveMyProfile } from "@/lib/orders.functions";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      { title: "Your details — Sweet Crumb Bakery" },
      { name: "description", content: "Save your contact phone number, delivery address and map pin." },
      { property: "og:title", content: "Your details — Sweet Crumb Bakery" },
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
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa">Your details</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Required for checkout, delivery dispatch, and order status updates.
            </p>
          </div>
          {hasValidPhone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Contact Phone Saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-700">
              Phone Number Required
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="mt-10 flex items-center justify-center py-12 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {!hasValidPhone && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-xs font-semibold text-amber-900">
                  Please provide your 10-digit mobile phone number below to enable placing bakery orders.
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={submit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full name <span className="text-berry">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Your full name"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Mobile phone number <span className="text-berry">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    required
                    className="rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used by our delivery riders and bakers to contact you.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Default delivery address</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Apartment/House No, Building, Street, Area, Landmark"
                  className="rounded-2xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delivery map pin</Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Tap the map to place your pin so our rider finds your gate or door effortlessly.
                </p>
                <ClientOnly fallback={<div className="h-64 w-full rounded-2xl bg-muted" />}>
                  <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted" />}>
                    <LocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onChange={(latitude, longitude) => setForm((f) => ({ ...f, latitude, longitude }))}
                    />
                  </Suspense>
                </ClientOnly>
                {form.latitude != null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pinned at {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                  </p>
                )}
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={busy}
                  size="lg"
                  className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl sm:w-auto px-8"
                >
                  {busy ? "Saving…" : "Save details"}
                </Button>
                {search.returnTo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: search.returnTo! })}
                    className="rounded-2xl"
                  >
                    Back to checkout
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}