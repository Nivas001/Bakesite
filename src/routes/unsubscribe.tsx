import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { unsubscribeFromNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Sparkles, MailOpen } from "lucide-react";

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
    <div className="relative min-h-[82vh] flex items-center justify-center px-4 py-8 sm:py-14 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 size-72 rounded-full bg-berry/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="glass-panel relative rounded-3xl sm:rounded-4xl border-2 border-border/80 p-6 sm:p-9 shadow-lift text-center space-y-5 sm:space-y-6 bg-card/95 backdrop-blur-md">
          
          {!unsubscribed ? (
            <>
              {/* Mailbox Animated Illustration Resource */}
              <div className="relative mx-auto flex items-center justify-center">
                <div className="relative size-36 sm:size-44 md:size-52 rounded-3xl overflow-hidden flex items-center justify-center bg-secondary/30 border border-border/60 shadow-inner">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="size-full object-contain select-none pointer-events-none"
                    aria-label="Open mailbox with letters illustration"
                  >
                    <source
                      src="/illustration/open-mailbox-with-envelopes-message-notification-and-correspondence.webm"
                      type="video/webm"
                    />
                    <source
                      src="/illustration/open-mailbox-with-envelopes-message-notification-and-correspondence.mp4"
                      type="video/mp4"
                    />
                    <MailOpen className="size-16 text-berry/70" />
                  </video>
                </div>
              </div>

              {/* Title & Subtitle with Blogh Display Font */}
              <div className="space-y-2 pt-1">
                <h1 className="font-blogh text-2xl sm:text-3xl md:text-4xl font-bold text-cocoa uppercase tracking-wide leading-tight">
                  Taking a pastry break?
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Too full on morning croissants or tidying your inbox? Enter your email below to take a pause from our dawn newsletter.
                </p>
              </div>

              {/* Unsubscribe Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-sm mx-auto">
                <div className="space-y-1.5">
                  <Label htmlFor="unsub-email" className="text-xs font-bold text-cocoa">
                    Your Email Address
                  </Label>
                  <Input
                    id="unsub-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-2xl text-xs sm:text-sm font-semibold border-2 border-border focus:border-cocoa"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs sm:text-sm shadow-soft active:scale-98 transition-all cursor-pointer"
                >
                  {busy ? "Pausing updates…" : "Pause My Bakery Updates"}
                </Button>
              </form>

              <div className="border-t border-border/60 pt-4 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cocoa transition-colors font-bold"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Never mind, take me back to the Bakery</span>
                </Link>
              </div>
            </>
          ) : (
            /* Confirmation State with Blogh Font */
            <div className="space-y-5 py-4">
              <div className="mx-auto flex size-16 sm:size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-soft">
                <CheckCircle2 className="size-8 sm:size-10" />
              </div>

              <div className="space-y-2">
                <h2 className="font-blogh text-2xl sm:text-3xl md:text-4xl font-bold text-cocoa uppercase tracking-wide leading-tight">
                  You&apos;re all set! 🌾
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  We have removed <span className="font-bold text-cocoa">{email}</span> from our newsletter dispatch list. We&apos;ll miss your inbox!
                </p>
                <p className="text-xs italic text-muted-foreground/80 pt-1">
                  Our morning ovens will still be baking at dawn whenever you crave warm sourdough or custom celebration cakes again.
                </p>
              </div>

              <div className="pt-2">
                <Button asChild size="default" className="rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs sm:text-sm h-11 px-8 shadow-lift cursor-pointer">
                  <Link to="/">Return to Bakery Counter</Link>
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
