import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useAuth, signOutEverywhere } from "@/hooks/use-appwrite-auth";
import { useCart } from "@/lib/cart";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/offers", label: "Offers" },
  { to: "/orders", label: "My orders" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const { user: session } = useAuth();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await signOutEverywhere();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-cocoa">
          Ani Bakes
          <span className="ml-1 text-berry">.</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-cocoa after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
              activeProps={{ className: "text-foreground after:scale-x-100" }}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="relative text-sm font-medium text-berry transition-colors hover:text-berry/80 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-berry after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
              activeProps={{ className: "after:scale-x-100" }}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Cart">
            <Link to="/cart" className="relative">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-berry text-[10px] font-semibold text-berry-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">
                  <User className="mr-1 size-4" /> Account
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden bg-berry text-berry-foreground hover:bg-berry/90 sm:inline-flex">
              <Link to="/auth" search={{ redirect: undefined }}>Sign in</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-10 flex flex-col gap-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-base font-medium text-berry">
                    Admin
                  </Link>
                )}
                {session ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)} className="text-base font-medium">
                      Account
                    </Link>
                    <button onClick={signOut} className="text-left text-base font-medium text-berry">
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" search={{ redirect: undefined }} onClick={() => setOpen(false)} className="text-base font-medium text-berry">
                    Sign in
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}