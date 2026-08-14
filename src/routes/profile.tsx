import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMyProfile, saveMyProfile } from "@/lib/orders.functions";
import { requestPhoneOtp, linkVerifiedPhone } from "@/lib/auth.functions";
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
  const requestOtpFn = useServerFn(requestPhoneOtp);
  const linkPhoneFn = useServerFn(linkVerifiedPhone);
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

  // Phone Onboarding / Verification State for Google / Unverified users
  const [verifyPhoneInput, setVerifyPhoneInput] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
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
      if (data.phone) {
        setVerifyPhoneInput(data.phone);
      }
    }
  }, [data]);

  const isPhoneVerified = Boolean(data?.phone && data.phone.trim().length >= 7);

  async function handleSendVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyPhoneInput.trim() || verifyPhoneInput.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    setVerifyingPhone(true);
    try {
      const res = await requestOtpFn({
        data: {
          phone: verifyPhoneInput,
          name: form.full_name || undefined,
        },
      });
      setOtpSent(true);
      if (res.devCode) {
        toast.success(`OTP sent to ${res.phone}! (Test Code: ${res.devCode})`);
      } else {
        toast.success(`6-digit OTP sent to ${res.phone}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send OTP code.");
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function handleConfirmPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCodeInput.trim() || otpCodeInput.length < 4) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }
    setVerifyingPhone(true);
    try {
      const res = await linkPhoneFn({
        data: {
          phone: verifyPhoneInput,
          code: otpCodeInput,
        },
      });
      if (res.ok) {
        setForm((f) => ({ ...f, phone: res.phone }));
        setOtpSent(false);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Phone number verified and permanently linked to your account!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired OTP code.");
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!isPhoneVerified) {
      toast.error("Please verify your mobile phone number before saving your profile.");
      return;
    }
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa">Your details</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Required for checkout, delivery dispatch, and order status updates.
            </p>
          </div>
          {isPhoneVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Verified Account
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="mt-10 flex items-center justify-center py-12 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* PHONE VERIFICATION ONBOARDING (IF PHONE NOT LINKED YET) */}
            {!isPhoneVerified && (
              <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h2 className="text-sm font-bold text-cocoa">
                      Verify your mobile phone number
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      To place orders, your phone number must be verified via 6-digit OTP. Once linked, it cannot be changed.
                    </p>
                  </div>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendVerifyOtp} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="verify-phone" className="text-xs font-semibold">
                        Mobile Phone Number
                      </Label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl border border-input bg-muted text-xs font-bold">
                          🇮🇳 +91
                        </span>
                        <Input
                          id="verify-phone"
                          type="tel"
                          required
                          placeholder="98765 43210"
                          value={verifyPhoneInput}
                          onChange={(e) => setVerifyPhoneInput(e.target.value)}
                          className="rounded-xl bg-background"
                        />
                        <Button
                          type="submit"
                          disabled={verifyingPhone}
                          className="bg-berry text-berry-foreground hover:bg-berry/90 rounded-xl px-4 text-xs font-semibold shrink-0"
                        >
                          {verifyingPhone ? "Sending…" : "Send OTP"}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmPhoneOtp} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Code sent to <strong className="font-mono">{verifyPhoneInput}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-berry underline font-semibold"
                      >
                        Change
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        id="verify-otp"
                        type="text"
                        maxLength={6}
                        required
                        placeholder="6-digit OTP"
                        value={otpCodeInput}
                        onChange={(e) => setOtpCodeInput(e.target.value)}
                        className="rounded-xl bg-background text-center font-mono tracking-widest"
                      />
                      <Button
                        type="submit"
                        disabled={verifyingPhone}
                        className="bg-berry text-berry-foreground hover:bg-berry/90 rounded-xl px-4 text-xs font-semibold shrink-0"
                      >
                        {verifyingPhone ? "Verifying…" : "Confirm OTP"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* MAIN PROFILE FORM */}
            <form className="space-y-6" onSubmit={submit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone">Phone number</Label>
                    {isPhoneVerified && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        🔒 Locked (Verified)
                      </span>
                    )}
                  </div>
                  <Input
                    id="phone"
                    value={form.phone}
                    disabled={isPhoneVerified}
                    readOnly={isPhoneVerified}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className={`rounded-xl ${
                      isPhoneVerified
                        ? "bg-muted/70 cursor-not-allowed font-medium text-foreground"
                        : ""
                    }`}
                  />
                  {isPhoneVerified && (
                    <p className="text-[11px] text-muted-foreground">
                      Your registered phone number is locked for account safety. You can provide an alternate delivery contact at checkout if needed.
                    </p>
                  )}
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
                  required
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
                    📍 Pinned at {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                  </p>
                )}
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={busy || !isPhoneVerified}
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