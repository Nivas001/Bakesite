import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { confirmPasswordRecovery } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search['userId'] === "string" ? (search['userId'] as string) : undefined,
    secret: typeof search['secret'] === "string" ? (search['secret'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — Sweet Crumb Bakery" },
      { name: "description", content: "Set a new password for your bakery account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const userId = search.userId;
  const secret = search.secret;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!userId || !secret) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-soft space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-3xl text-destructive">
            !
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-cocoa">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This password reset link is missing required security tokens or has expired.
            </p>
          </div>
          <Button asChild className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold h-11">
            <Link to="/auth" search={{ redirect: undefined }}>
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setBusy(true);
    try {
      await confirmPasswordRecovery(userId!, secret!, newPassword);
      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Invalid or expired password reset link. Please request a new one."
      );
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-soft space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600">
            ✓
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-cocoa">Password Updated!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
          </div>
          <Button asChild className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold h-11">
            <Link to="/auth" search={{ redirect: undefined }}>
              Sign In Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-cocoa">Set New Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new secure password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-pass" className="text-xs font-semibold">
              New Password <span className="text-berry">*</span>
            </Label>
            <Input
              id="new-pass"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass" className="text-xs font-semibold">
              Confirm New Password <span className="text-berry">*</span>
            </Label>
            <Input
              id="confirm-pass"
              type="password"
              required
              minLength={8}
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 h-11 font-semibold text-xs"
          >
            {busy ? "Updating Password…" : "Save New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
