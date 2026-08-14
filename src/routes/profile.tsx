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
      { name: "description", content: "Save your delivery address and map pin for faster checkout." },
      { property: "og:title", content: "Your details — Sweet Crumb Bakery" },
      { property: "og:description", content: "Save your delivery address and map pin." },
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

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await save({ data: form });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Details saved");
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
        <h1 className="font-display text-3xl font-bold text-cocoa">Your details</h1>
        <p className="mt-3 text-muted-foreground">
          We use these at checkout. Drop a pin so our rider finds your door first try.
        </p>

        {isLoading ? (
          <div className="mt-10 flex items-center justify-center py-12 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery address</Label>
              <Textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Map pin</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Tap the map to place or move your marker, or use the locate button to find your current position.
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
                  Pinned at {form.latitude}, {form.longitude}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={busy} size="lg" className="w-full bg-berry text-berry-foreground hover:bg-berry/90 sm:w-auto">
                {busy ? "Saving…" : "Save details"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}