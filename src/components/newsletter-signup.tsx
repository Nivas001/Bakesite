import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const subscribe = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await subscribe({ data: { email } });
      setEmail("");
      toast.success("You're on the list — fresh bakes news incoming.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm items-center gap-1.5">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-9 rounded-full bg-background/85 px-3.5 text-xs placeholder:text-muted-foreground/70 shadow-2xs border-border/70 focus-visible:ring-berry"
      />
      <Button
        type="submit"
        size="sm"
        disabled={busy}
        className="h-9 shrink-0 rounded-full bg-berry px-4 text-xs font-semibold text-berry-foreground hover:bg-berry/90 shadow-xs active:scale-95 transition-all cursor-pointer"
      >
        {busy ? "Joining…" : "Join"}
      </Button>
    </form>
  );
}