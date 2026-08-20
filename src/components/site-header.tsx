import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Menu,
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

const NAV = [
  { to: "/", label: "Home", icon: Home, badge: null },
  { to: "/shop", label: "Shop", icon: Store, badge: null },
  { to: "/about", label: "About", icon: Sparkles, badge: null },
  { to: "/offers", label: "Offers", icon: Tag, badge: null },
  { to: "/orders", label: "Orders", icon: Package, badge: null },
] as const;

export function SiteHeader() {
  const { count } = useCart();
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
          : "border-border/50 bg-background/65 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]"
      } transition-all duration-700`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-6">
        
        {/* Brand Logo with Liquid Glass Pill */}
        <Link
          to="/"
          className="group flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all hover:bg-black/5"
        >
          <span
            style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
            className="font-nimbus text-xl sm:text-2xl font-bold tracking-tight text-cocoa transition-colors duration-700 group-hover:scale-[1.02]"
          >
            Ani Bakes
          </span>
          <span
            style={
              isHeroActive && dotColor
                ? { backgroundColor: dotColor }
                : undefined
            }
            className="flex size-2 rounded-full bg-berry animate-pulse transition-colors duration-700"
          />
        </Link>

        {/* Desktop Navigation with Floating Frosted Glass Pills */}
        <nav
          style={
            isHeroActive
              ? {
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  borderColor: "rgba(44, 24, 16, 0.12)",
                }
              : undefined
          }
          className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-secondary/35 p-1 backdrop-blur-md shadow-2xs transition-colors duration-700"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
              className="relative rounded-full px-3.5 py-1 text-xs lg:text-sm font-semibold text-muted-foreground whitespace-nowrap transition-all hover:bg-card hover:text-foreground hover:shadow-2xs active:scale-95"
              activeProps={{
                className: "bg-card text-cocoa font-bold shadow-xs ring-1 ring-border/80",
              }}
            >
              {item.label}
              {item.badge && (
                <span className="ml-1.5 rounded-full bg-berry/15 px-1.5 py-0.2 text-[9px] font-extrabold text-berry">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons (Admin, Cart, Account, Mobile Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin Portal Button */}
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
            className="inline-flex rounded-full border-berry/30 bg-berry/10 text-berry hover:bg-berry/20 text-xs font-semibold h-8 px-2.5 sm:px-3 shadow-2xs backdrop-blur-xs transition-colors duration-700"
          >
            <Link to="/admin">
              <ShieldCheck className="mr-1 sm:mr-1.5 size-3.5" />
              <span>Admin</span>
            </Link>
          </Button>

          {/* Cart Icon with Liquid Glow Badge */}
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
            className="relative size-9 rounded-full border border-border/40 bg-card/60 backdrop-blur-md shadow-2xs transition-all hover:bg-secondary hover:scale-105 active:scale-95"
            aria-label="Cart"
          >
            <Link to="/cart">
              <ShoppingBag
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="size-4.5 text-foreground transition-colors duration-700"
              />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-berry text-[10px] font-bold text-berry-foreground shadow-xs animate-in zoom-in-75 ring-2 ring-background">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>

          {/* Auth State Button */}
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
                className="hidden text-xs font-semibold text-muted-foreground hover:text-foreground sm:inline-flex h-8 px-3 rounded-full border border-border/40 bg-card/40 backdrop-blur-xs transition-colors duration-700"
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
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="hidden text-xs font-semibold text-muted-foreground hover:text-destructive sm:inline-flex h-8 px-2.5 rounded-full hover:bg-destructive/10 transition-colors duration-700"
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
              className="hidden bg-berry text-berry-foreground hover:bg-berry/90 sm:inline-flex h-8 sm:h-9 px-4 rounded-full text-xs sm:text-sm font-semibold shadow-soft whitespace-nowrap transition-all duration-700"
            >
              <Link to="/auth" search={{ redirect: undefined }}>Sign in</Link>
            </Button>
          )}

          {/* Mobile Drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                style={isHeroActive && activeTextColor ? { color: activeTextColor } : undefined}
                className="md:hidden transition-colors duration-700"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between w-72 sm:w-80 p-5 bg-background">
              
              {/* Drawer Top Header & Navigation */}
              <div>
                <div className="flex items-center gap-2 pb-5 mb-4 border-b border-border/60">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-berry/10 text-berry">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="font-nimbus text-lg font-bold text-cocoa leading-tight">
                      Ani Bakes<span className="text-berry">.</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">Fresh small-batch bakery</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-secondary/70 active:scale-[0.98]"
                        activeProps={{ className: "bg-secondary font-semibold text-cocoa" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground transition-colors group-hover:bg-berry group-hover:text-berry-foreground">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-berry transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="rounded-full bg-berry/15 px-2 py-0.5 text-[9px] font-bold text-berry">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}

                  {/* Cart quick link inside drawer */}
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
                      <span className="text-sm font-medium text-foreground group-hover:text-berry transition-colors">
                        Cart
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {count > 0 && (
                        <span className="rounded-full bg-berry px-2 py-0.5 text-[10px] font-bold text-berry-foreground">
                          {count}
                        </span>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>

                  {/* Admin link inside drawer */}
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-berry/10 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-berry/15 text-berry">
                        <ShieldCheck className="size-4" />
                      </div>
                      <span className="text-sm font-semibold text-berry">
                        Admin Portal
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-berry/50 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </nav>
              </div>

              {/* Drawer Bottom: Highlighted Sign In / Account Section */}
              <div className="pt-4 border-t border-border/60">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-2xs transition-all hover:border-berry/50 hover:bg-secondary/40 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-berry/15 text-berry font-bold text-xs">
                          {session.name ? session.name.slice(0, 2).toUpperCase() : <User className="size-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {session.name || "My Account"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {session.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 w-full rounded-xl py-2 text-xs font-medium text-muted-foreground hover:text-berry transition-colors cursor-pointer"
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
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-berry px-4 py-3 text-sm font-bold text-berry-foreground shadow-soft transition-all duration-200 hover:bg-berry/90 hover:shadow-lift active:scale-95"
                    >
                      <LogIn className="size-4" />
                      <span>Sign in to Ani Bakes</span>
                    </Link>
                    <p className="text-center text-[10px] text-muted-foreground">
                      Sign in for saved addresses & order tracking
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