import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/integrations/appwrite/client";
import { refreshAuth } from "@/hooks/use-appwrite-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Sweet Crumb Bakery" },
      { name: "description", content: "Sign in to place and track your Sweet Crumb orders." },
      { property: "og:title", content: "Sign in — Sweet Crumb Bakery" },
      { property: "og:description", content: "Sign in to place and track your bakery orders." },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const target = safePath(search.redirect);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshAuth().then((user) => {
      if (user) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  async function signIn(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      await refreshAuth();
      navigate({ to: target, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function signUp(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await signUpWithEmail(email, password, fullName);
      await refreshAuth();
      navigate({ to: target, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account");
    } finally {
      setBusy(false);
    }
  }

  async function google(): Promise<void> {
    signInWithGoogle(`${window.location.origin}${target}`, `${window.location.origin}/auth`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-cocoa">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Sign in to place orders and track your slots.
      </p>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Button variant="outline" className="w-full" onClick={google}>
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="mt-4 space-y-4" onSubmit={signIn}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-berry text-berry-foreground hover:bg-berry/90">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="mt-4 space-y-4" onSubmit={signUp}>
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email-up">Email</Label>
                <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password-up">Password</Label>
                <Input id="password-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-berry text-berry-foreground hover:bg-berry/90">
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}