import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { confirmEmailVerification } from "@/integrations/appwrite/client";
import { refreshAuth } from "@/hooks/use-appwrite-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search['userId'] === "string" ? (search['userId'] as string) : undefined,
    secret: typeof search['secret'] === "string" ? (search['secret'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Email Verification — Sweet Crumb Bakery" },
      { name: "description", content: "Verify your email address for Sweet Crumb Bakery." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const search = Route.useSearch();
  const userId = search.userId;
  const secret = search.secret;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    userId && secret ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId || !secret) {
      setStatus("error");
      setErrorMessage("No verification credentials found in this link.");
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        await confirmEmailVerification(userId!, secret!);
        await refreshAuth();
        if (isMounted) {
          setStatus("success");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Invalid or expired verification link.");
        }
      }
    }

    void verify();

    return () => {
      isMounted = false;
    };
  }, [userId, secret]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-berry/30 border-t-berry" />
            <h2 className="font-display text-2xl font-bold text-cocoa">Verifying your email…</h2>
            <p className="text-sm text-muted-foreground">Please wait while we activate your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600">
              ✓
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-cocoa">Email Verified!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your email address has been verified successfully. You can now complete your bakery profile and place orders!
              </p>
            </div>
            <div className="pt-2">
              <Button asChild className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold h-11">
                <Link to="/profile">Complete Profile & Add Phone</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-3xl text-destructive">
              !
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-cocoa">Verification Failed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage || "The verification link may have expired or is invalid."}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <Button asChild className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-semibold h-11">
                <Link to="/auth" search={{ redirect: undefined }}>
                  Go to Sign In
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
