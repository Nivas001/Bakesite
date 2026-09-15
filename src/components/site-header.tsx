import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  Home,
  Store,
  Tag,
  Package,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth, signOutEverywhere } from "@/hooks/use-appwrite-auth";
import { useCart } from "@/lib/cart";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHeroNavbarTheme } from "@/lib/hero-navbar-theme";
import { formatCurrency } from "@/lib/pricing";

const NAV = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/shop", label: "Shop", icon: Store, exact: false },
  { to: "/about", label: "About", icon: Sparkles, exact: false },
  { to: "/offers", label: "Offers", icon: Tag, exact: false },
  { to: "/orders", label: "Orders", icon: Package, exact: false },
] as const;

export function SiteHeader() {
  const { count, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const { user: session } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { inHero, bgColor, textColor, dotColor, btnBg, btnText } = useHeroNavbarTheme();

  const isHomePage = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    await signOutEverywhere();
    navigate({ to: "/", replace: true });
  }

  // Active theme overrides
  const isHeroActive = isHomePage && scrollY < 650 && (inHero || scrollY < 100);
  const activeBgColor = isHeroActive ? (bgColor ?? "#F5C2CD") : null;
  const activeTextColor = isHeroActive ? (textColor ?? "#3A1018") : null;
  const showBorder = scrollY > 20 || !isHeroActive;
  // A tall header eats a third of a phone screen once you start scrolling.
  const condensed = scrollY > 80;

  return (
    <header
      style={
        isHeroActive && activeBgColor
          ? {
              backgroundColor: activeBgColor,
              borderColor: showBorder ? "rgba(44, 24, 16, 0.15)" : "transparent",
            }
          : undefined
      }
      className={`sticky top-0 z-50 border-b ${
        isHeroActive
          ? showBorder
            ? "border-[#2C1810]/15 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]"
            : "border-transparent shadow-none"
          : "border-border/50 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]"
      } transition-all duration-700`}
    >
      <div
        className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3.5 transition-[height] duration-300 sm:gap-4 sm:px-6 ${
          condensed ? "h-14" : "h-16"
        }`}
      >
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all hover:bg-black/5"
        >
          <span
            style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
            className={`font-nimbus font-bold tracking-tight text-cocoa transition-all duration-500 group-hover:scale-[1.02] ${
              condensed ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
          >
            Aniii Bakes
          </span>
          <span
            style={isHeroActive && dotColor ? { backgroundColor: dotColor } : undefined}
            className="flex size-2 animate-pulse rounded-full bg-berry transition-colors duration-700"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          style={
            isHeroActive
              ? {
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  borderColor: "rgba(44, 24, 16, 0.12)",
                }
              : undefined
          }
          className="hidden items-center gap-1 rounded-full border border-border/60 bg-secondary/35 p-1 shadow-2xs backdrop-blur-md transition-colors duration-700 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
              className="relative rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:shadow-2xs active:scale-95 lg:text-sm"
              activeProps={{
                className: "bg-card text-cocoa font-bold shadow-xs ring-1 ring-border/80",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right-hand actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Jump straight to browsing rather than making people find the nav. */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            style={
              isHeroActive
                ? {
                    backgroundColor: "rgba(255, 255, 255, 0.45)",
                    borderColor: "rgba(44, 24, 16, 0.12)",
                    color: activeTextColor ?? undefined,
                  }
                : undefined
            }
            className="hidden size-9 rounded-full border border-border/40 bg-card/60 shadow-2xs backdrop-blur-md transition-all hover:scale-105 hover:bg-secondary active:scale-95 lg:inline-flex"
            aria-label="Search bakes"
          >
            <Link to="/shop">
              <Search
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="size-4 text-foreground transition-colors duration-700"
              />
            </Link>
          </Button>

          {/* Admin portal — only for accounts that actually have access. It used
              to be shown to every visitor, who then hit an "admins only" wall. */}
          {isAdmin && (
            <Button
              asChild
              variant="outline"
              size="sm"
              style={
                isHeroActive
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.45)",
                      borderColor: "rgba(44, 24, 16, 0.15)",
                      color: activeTextColor ?? undefined,
                    }
                  : undefined
              }
              className="inline-flex h-8 rounded-full border-berry/30 bg-berry/10 px-2.5 text-xs font-semibold text-berry-deep shadow-2xs backdrop-blur-xs transition-colors duration-700 hover:bg-berry/20 sm:px-3"
            >
              <Link to="/admin">
                <ShieldCheck className="mr-1 size-3.5 sm:mr-1.5" />
                <span>Admin</span>
              </Link>
            </Button>
          )}

          {/* Cart — shows the running total on desktop, where there is room. */}
          <Link
            to="/cart"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
            style={
              isHeroActive
                ? {
                    backgroundColor: "rgba(255, 255, 255, 0.45)",
                    borderColor: "rgba(44, 24, 16, 0.12)",
                    color: activeTextColor ?? undefined,
                  }
                : undefined
            }
            className="relative flex h-9 items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-2.5 shadow-2xs backdrop-blur-md transition-all hover:scale-105 hover:bg-secondary active:scale-95"
          >
            <ShoppingBag
              style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
              className="size-4.5 text-foreground transition-colors duration-700"
            />
            {count > 0 && (
              <>
                <span className="animate-in zoom-in-75 absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-berry text-[11px] font-bold text-berry-foreground shadow-xs ring-2 ring-background sm:hidden">
                  {count > 9 ? "9+" : count}
                </span>
                <span
                  style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                  className="hidden text-xs font-bold text-cocoa tabular-nums sm:inline"
                >
                  {formatCurrency(total)}
                </span>
              </>
            )}
          </Link>

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="sm"
                style={
                  isHeroActive
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.45)",
                        borderColor: "rgba(44, 24, 16, 0.12)",
                        color: activeTextColor ?? undefined,
                      }
                    : undefined
                }
                className="hidden h-8 rounded-full border border-border/40 bg-card/40 px-3 text-xs font-semibold text-muted-foreground backdrop-blur-xs transition-colors duration-700 hover:text-foreground sm:inline-flex"
              >
                <Link to="/profile">
                  <User className="mr-1.5 size-3.5" />
                  Account
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                aria-label="Sign out"
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="hidden h-8 rounded-full px-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-700 hover:bg-destructive/10 hover:text-destructive sm:inline-flex"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              size="sm"
              style={
                isHeroActive && btnBg
                  ? {
                      backgroundColor: btnBg,
                      color: btnText ?? "#ffffff",
                      borderColor: "transparent",
                    }
                  : undefined
              }
              className="hidden h-8 rounded-full bg-berry px-4 text-xs font-semibold whitespace-nowrap text-berry-foreground shadow-soft transition-all duration-700 hover:bg-berry/90 sm:inline-flex sm:h-9 sm:text-sm"
            >
              <Link to="/auth" search={{ redirect: undefined }}>
                Sign in
              </Link>
            </Button>
          )}

          {/* Mobile drawer — secondary destinations only; the primary five live
              in the tab bar at the bottom of the screen. */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="transition-colors duration-700 md:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-72 flex-col justify-between bg-background p-5 sm:w-80"
            >
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-berry/10 text-berry-deep">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="font-nimbus text-lg leading-tight font-bold text-cocoa">
                      Aniii Bakes<span className="text-berry-deep">.</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Fresh small-batch bakery</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        activeOptions={{ exact: item.exact }}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-secondary/70 active:scale-[0.98]"
                        activeProps={{ className: "bg-secondary font-semibold text-cocoa" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground transition-colors group-hover:bg-berry group-hover:text-berry-foreground">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-berry-deep">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>
                    );
                  })}

                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-secondary/70 active:scale-[0.98]"
                    activeProps={{ className: "bg-secondary font-semibold text-cocoa" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground transition-colors group-hover:bg-berry group-hover:text-berry-foreground">
                        <ShoppingBag className="size-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground transition-colors group-hover:text-berry-deep">
                        Cart
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {count > 0 && (
                        <span className="rounded-full bg-berry px-2 py-0.5 text-[11px] font-bold text-berry-foreground tabular-nums">
                          {formatCurrency(total)}
                        </span>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-berry/10 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-berry/15 text-berry-deep">
                          <ShieldCheck className="size-4" />
                        </div>
                        <span className="text-sm font-semibold text-berry-deep">Admin portal</span>
                      </div>
                      <ChevronRight className="size-4 text-berry-deep/50 transition-all group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </nav>
              </div>

              <div className="border-t border-border/60 pt-4">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-2xs transition-all hover:border-berry/50 hover:bg-secondary/40 active:scale-[0.98]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-berry/15 text-xs font-bold text-berry-deep">
                          {session.name ? (
                            session.name.slice(0, 2).toUpperCase()
                          ) : (
                            <User className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">
                            {session.name || "My Account"}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {session.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-berry-deep"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/auth"
                      search={{ redirect: undefined }}
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3 text-sm font-bold text-berry-foreground shadow-soft transition-all duration-200 hover:bg-berry/90 hover:shadow-lift active:scale-95"
                    >
                      <LogIn className="size-4" />
                      <span>Sign in to Aniii Bakes</span>
                    </Link>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Sign in for saved addresses &amp; order tracking
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
