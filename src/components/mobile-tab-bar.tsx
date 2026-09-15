import { Link } from "@tanstack/react-router";
import { Home, ShoppingBag, ShoppingCart, Store, Tag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/pricing";

const TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/shop", label: "Shop", icon: Store, exact: false },
  { to: "/offers", label: "Offers", icon: Tag, exact: false },
  { to: "/orders", label: "Orders", icon: ShoppingBag, exact: false },
] as const;

/**
 * Phone navigation.
 *
 * On a phone every destination lived behind a hamburger in a header that
 * scrolls away, so moving between the shop, the cart and orders cost two taps
 * and a scroll back to the top. Thumb-height tabs cost one, and the cart
 * finally shows its running total where it can be seen.
 */
export function MobileTabBar() {
  const { count, total } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {TABS.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex h-14 flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors"
              activeProps={{ className: "text-berry-deep" }}
            >
              <Icon className="size-4.5" />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          </li>
        ))}

        <li className="flex-1">
          <Link
            to="/cart"
            className="flex h-14 flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors"
            activeProps={{ className: "text-berry-deep" }}
          >
            <span className="relative">
              <ShoppingCart className="size-4.5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-berry px-1 text-[9px] font-bold text-berry-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold tabular-nums">
              {count > 0 ? formatCurrency(total) : "Cart"}
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
