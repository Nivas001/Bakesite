import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-appwrite-auth";
import { Button } from "@/components/ui/button";

export function RequireAuth({ title, children }: { title: string; children: ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">{title}</h1>
        <p className="mt-3 text-muted-foreground">Sign in to continue.</p>
        <Button asChild className="mt-8 bg-berry text-berry-foreground hover:bg-berry/90">
          <Link to="/auth" search={{ redirect: pathname }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}