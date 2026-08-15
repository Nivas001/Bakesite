import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { unsubscribeFromNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Cookie, Heart, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe from Newsletter — Ani Bakes Bakery" },
      { name: "description", content: "Take a break from Ani Bakes fresh bakes newsletter." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState(search.email || "");
  const [busy, setBusy] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  const unsubscribeFn = useServerFn(unsubscribeFromNewsletter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setBusy(true);
    try {
      await unsubscribeFn({ data: { email: email.trim() } });
      setUnsubscribed(true);
      toast.success("You have been unsubscribed from our newsletter.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unsubscribe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="glass-panel relative rounded-3xl border border-border/80 p-6 sm:p-8 shadow-soft text-center space-y-6">
        
        {!unsubscribed ? (
          <>
            {/* Header Icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/80 text-2xl shadow-2xs border border-border/60">
              🧁
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-cocoa">
                Taking a pastry break?
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Too full on croissants or just tidying your inbox? Enter your email below to take a pause from our morning bakes newsletter.
              </p>
            </div>

            {/* Unsubscribe Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="unsub-email" className="text-xs font-semibold text-cocoa">
                  Your Email Address
                </Label>
                <Input
                  id="unsub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 rounded-xl text-xs font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-10 rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs shadow-soft active:scale-98 transition-all cursor-pointer"
              >
                {busy ? "Pausing updates…" : "Pause My Bakery Updates"}
              </Button>
            </form>

            <div className="border-t border-border/60 pt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="size-3.5" />
                Never mind, take me back to the Bakery
              </Link>
            </div>
          </>
        ) : (
          /* Confirmation State */
          <div className="space-y-5 py-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-2xs">
              <CheckCircle2 className="size-7" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-cocoa">
                You&apos;re all set! 🌾
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We have removed <span className="font-semibold text-foreground">{email}</span> from our newsletter list. We&apos;ll miss your inbox!
              </p>
              <p className="mt-2 text-xs italic text-muted-foreground/80">
                Our morning ovens will still be baking at dawn whenever you crave warm sourdough or cookies again.
              </p>
            </div>

            <Button asChild size="sm" className="rounded-xl bg-berry text-berry-foreground font-semibold text-xs px-6">
              <Link to="/">Return to Bakery Counter</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
