import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/pricing";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Ani Bakes Bakery" },
      { name: "description", content: "Review your Ani Bakes bakes before choosing a slot." },
      { property: "og:title", content: "Your cart — Ani Bakes Bakery" },
      { property: "og:description", content: "Review your bakes before choosing a slot." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQuantity, remove, subtotal, discountTotal, total } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Nothing on the tray yet.</p>
        <Button asChild className="mt-8 bg-berry text-berry-foreground hover:bg-berry/90">
          <Link to="/shop">Browse the bakery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-3xl font-bold text-cocoa">Your cart</h1>
        <ul className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center gap-4 p-4">
              <img
                src={line.imageUrl ?? "/products/croissant.jpg"}
                alt={line.name}
                className="size-20 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: line.slug }}
                  className="font-medium hover:underline"
                >
                  {line.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(line.unitPrice)} each
                </p>
              </div>
              <div className="flex items-center rounded-full border border-border">
                <button
                  className="px-3 py-1.5"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                >
                  −
                </button>
                <span className="w-7 text-center text-sm">{line.quantity}</span>
                <button
                  className="px-3 py-1.5"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right text-sm font-semibold">
                {formatCurrency(line.unitPrice * line.quantity)}
              </span>
              <button
                aria-label={`Remove ${line.name}`}
                onClick={() => remove(line.productId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-berry">
              <dt>Offers</dt>
              <dd>−{formatCurrency(discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>
        <Button asChild className="mt-6 w-full bg-berry text-berry-foreground hover:bg-berry/90">
          <Link to="/checkout">Choose a slot</Link>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Payment is only requested once the bakery approves your slot.
        </p>
      </aside>
    </div>
  );
}