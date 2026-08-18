import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Clock, ShieldCheck } from "lucide-react";
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
  const { lines, setQuantity, remove, clear, count, subtotal, discountTotal, total } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20 text-center">
        <div className="relative mx-auto flex size-40 sm:size-52 items-center justify-center mb-4">
          <img
            src="/illustration/business-3d-red-shopping-cart.png"
            alt="Empty bakery shopping cart"
            className="size-full object-contain drop-shadow-md select-none pointer-events-none"
          />
        </div>
        <h1 className="font-blogh text-2xl sm:text-3xl md:text-4xl font-bold text-cocoa uppercase tracking-wide">
          Your bake tray is empty
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Fresh morning pastries, crusty country sourdough, and celebration layer cakes are fresh from the oven.
        </p>
        <Button asChild className="mt-6 rounded-2xl bg-berry px-8 h-11 text-xs sm:text-sm font-bold text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer">
          <Link to="/shop">Browse Bakery Counter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      
      {/* Page Header with Total Items Badge */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-berry/10 border border-berry/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-berry">
              <Sparkles className="size-3" /> Fresh Bake Tray
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({count} {count === 1 ? "bake" : "bakes"})
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold text-cocoa leading-tight">
            Your cart
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link to="/shop" className="font-medium text-berry hover:underline">
            + Add more bakes
          </Link>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            Clear tray
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Activated on Tablet (md: at 768px) and Desktop */}
      <div className="grid gap-6 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_360px] items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-soft divide-y divide-border/60">
          {lines.map((line) => {
            const lineTotal = line.unitPrice * line.quantity;
            const hasBaseDiscount = line.basePrice && line.basePrice > line.unitPrice;

            return (
              <div
                key={line.productId}
                className="flex items-start gap-3 p-3.5 sm:p-4 transition-colors hover:bg-secondary/20"
              >
                {/* 1. Product Thumbnail */}
                <Link
                  to="/product/$slug"
                  params={{ slug: line.slug }}
                  className="shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-secondary/40 group"
                >
                  <img
                    src={line.imageUrl ?? "/products/croissant.jpg"}
                    alt={line.name}
                    className="size-16 sm:size-20 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* 2. Responsive Content Layout (2 Rows on Mobile, Fluid on Tablet/Desktop) */}
                <div className="flex flex-1 flex-col justify-between min-w-0 self-stretch">
                  
                  {/* Top Row: Name, Unit Price, and Delete Icon */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        className="font-display font-semibold text-xs sm:text-base text-cocoa hover:text-berry transition-colors line-clamp-1"
                      >
                        {line.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        {hasBaseDiscount && (
                          <span className="line-through text-muted-foreground/60">
                            {formatCurrency(line.basePrice!)}
                          </span>
                        )}
                        <span className="font-medium text-cocoa/90">
                          {formatCurrency(line.unitPrice)} each
                        </span>
                      </div>
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      aria-label={`Remove ${line.name} from tray`}
                      onClick={() => remove(line.productId)}
                      className="text-muted-foreground/60 hover:text-destructive transition-colors p-1 -mr-1 -mt-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="size-3.5 sm:size-4" />
                    </button>
                  </div>

                  {/* Bottom Row: Minimal Stepper on Left, Bold Line Total on Right */}
                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-2 pt-1">
                    
                    {/* Stepper: [ - ]  qty  [ + ] */}
                    <div className="inline-flex h-7 sm:h-8 items-center gap-1 sm:gap-1.5 rounded-full bg-secondary/80 px-1 sm:px-1.5 py-0.5 border border-border/70 shadow-2xs">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.name} quantity`}
                        className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer text-xs font-bold"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      >
                        −
                      </button>

                      <span className="min-w-4 px-1 text-center text-xs font-bold text-cocoa tabular-nums">
                        {line.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase ${line.name} quantity`}
                        className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer text-xs font-bold"
                        onClick={() => setQuantity(line.productId, Math.min(30, line.quantity + 1))}
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <span className="font-sans text-xs sm:text-base font-bold text-cocoa tracking-tight">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Order Summary Card */}
        <aside className="md:sticky md:top-20 rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-soft flex flex-col gap-4">
          <div>
            <h2 className="font-display text-base sm:text-xl font-bold text-cocoa">Order Summary</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Includes all baked-to-order artisan items
            </p>
          </div>

          <dl className="space-y-2 border-t border-border/60 pt-3 text-xs sm:text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal ({count} bakes)</dt>
              <dd className="font-medium text-foreground">{formatCurrency(subtotal)}</dd>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between items-center text-berry font-medium">
                <dt className="flex items-center gap-1">
                  <span>Weekly Specials</span>
                </dt>
                <dd className="font-semibold">−{formatCurrency(discountTotal)}</dd>
              </div>
            )}

            <div className="flex justify-between border-t border-border/60 pt-3 text-sm sm:text-base font-bold text-cocoa">
              <dt>Estimated Total</dt>
              <dd className="text-base sm:text-lg font-black text-cocoa">{formatCurrency(total)}</dd>
            </div>
          </dl>

          {/* Checkout Action Button */}
          <Button
            asChild
            size="lg"
            className="w-full rounded-2xl bg-berry text-berry-foreground font-bold text-xs sm:text-sm shadow-lift hover:scale-[1.02] hover:bg-berry/90 active:scale-95 transition-all cursor-pointer h-11 sm:h-12"
          >
            <Link to="/checkout" className="flex items-center justify-center gap-2">
              <span>Choose slot & checkout</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          {/* Bakery Assurance Trust Chips */}
          <div className="space-y-2.5 rounded-2xl bg-secondary/40 p-3 text-[11px] text-muted-foreground border border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="size-8 shrink-0 rounded-xl overflow-hidden bg-background/80 border border-border/60 flex items-center justify-center">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="size-full object-contain pointer-events-none"
                >
                  <source src="/illustration/3d-stickle-credit-card-terminal-pay.webm" type="video/webm" />
                  <source src="/illustration/3d-stickle-credit-card-terminal-pay.mp4" type="video/mp4" />
                </video>
              </div>
              <div>
                <p className="font-bold text-cocoa text-xs">Instant UPI & Card Payment</p>
                <p className="text-[10px] text-muted-foreground">Secures your morning bake slot</p>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-border/40">
              <Clock className="size-3.5 text-berry shrink-0 mt-0.5" />
              <span>Baked fresh at 4:00 AM on your chosen delivery date</span>
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}