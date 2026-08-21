import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import {
  discountLabel,
  finalPrice,
  formatCurrency,
  hasDiscount,
  type CatalogProduct,
} from "@/lib/pricing";

function QuickAdd({ product }: { product: CatalogProduct }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const price = finalPrice(product.price, product.discount_type, product.discount_value);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="glass-soft flex h-8 sm:h-9 items-center gap-0.5 rounded-xl p-0.5 sm:p-1 border border-border/60">
        <button
          type="button"
          aria-label={`Decrease ${product.name} quantity`}
          className="grid size-6 sm:size-7 place-items-center rounded-lg text-cocoa transition hover:bg-card active:scale-90"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          <Minus className="size-2.5 sm:size-3" />
        </button>
        <span className="w-4 sm:w-5 text-center text-xs font-semibold tabular-nums text-cocoa">{qty}</span>
        <button
          type="button"
          aria-label={`Increase ${product.name} quantity`}
          className="grid size-6 sm:size-7 place-items-center rounded-lg text-cocoa transition hover:bg-card active:scale-90"
          onClick={() => setQty((q) => Math.min(20, q + 1))}
        >
          <Plus className="size-2.5 sm:size-3" />
        </button>
      </div>
      <Button
        size="sm"
        className="h-8 sm:h-9 flex-1 rounded-xl bg-berry text-berry-foreground text-xs font-medium shadow-xs transition-all duration-200 hover:scale-[1.01] hover:bg-berry/90 active:scale-98 cursor-pointer"
        onClick={() => {
          add(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              unitPrice: price,
              basePrice: product.price,
              imageUrl: product.image_url,
            },
            qty,
          );
          toast.success(`${qty} × ${product.name} added to cart`);
          setQty(1);
        }}
      >
        <ShoppingBag className="mr-1 size-3 sm:size-3.5" />
        <span>Quick add</span>
      </Button>
    </div>
  );
}

export function FeaturedProducts({ products }: { products: CatalogProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;
        children.forEach((child, i) => {
          const dist = Math.abs(child.offsetLeft - track.offsetLeft + child.clientWidth / 2 - center);
          if (dist < best) {
            best = dist;
            nearest = i;
          }
        });
        setActive(nearest);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div className="relative mt-6 sm:mt-10">
      <div className="pointer-events-none absolute -top-13 sm:-top-14 right-0 hidden items-center gap-1.5 sm:gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => scrollToIndex(Math.max(0, active - 1))}
          className="glass-soft pointer-events-auto grid size-8.5 sm:size-9.5 place-items-center rounded-full text-cocoa shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95 disabled:opacity-35 cursor-pointer"
          disabled={active === 0}
        >
          <ChevronLeft className="size-4 sm:size-4.5" />
        </button>
        <button
          type="button"
          aria-label="Next products"
          onClick={() => scrollToIndex(Math.min(products.length - 1, active + 1))}
          className="glass-soft pointer-events-auto grid size-8.5 sm:size-9.5 place-items-center rounded-full text-cocoa shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95 disabled:opacity-35 cursor-pointer"
          disabled={active === products.length - 1}
        >
          <ChevronRight className="size-4 sm:size-4.5" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => {
          const price = finalPrice(product.price, product.discount_type, product.discount_value);
          const discounted = hasDiscount(product.discount_type, product.discount_value);
          return (
            <article
              key={product.id}
              className="glass-panel group flex w-[72%] xs:w-[62%] shrink-0 snap-start flex-col rounded-2xl p-2.5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:w-[42%] sm:rounded-[2rem] sm:p-4 lg:w-[31.5%]"
            >
              <Link
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="relative block overflow-hidden rounded-xl sm:rounded-2xl"
              >
                <img
                  src={product.image_url ?? "/products/croissant.jpg"}
                  alt={product.name}
                  loading="lazy"
                  width={600}
                  height={600}
                  draggable={false}
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {discounted && (
                  <span className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5 rounded-full bg-berry px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-berry-foreground shadow-soft">
                    {discountLabel(product.discount_type, product.discount_value)}
                  </span>
                )}
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex flex-col items-end">
                  {discounted && (
                    <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/80 line-through drop-shadow-xs mb-0.5">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  <span className="rounded-full bg-card/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold text-cocoa shadow-soft backdrop-blur">
                    {formatCurrency(price)}
                  </span>
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-1.5 px-1 pb-0.5 pt-3 sm:gap-2.5 sm:px-2 sm:pt-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">
                  {product.category_name}
                </p>
                <h3 className="font-blogh uppercase tracking-wide text-sm sm:text-lg font-bold leading-snug line-clamp-1 sm:line-clamp-2 text-cocoa">
                  <Link to="/shop/$slug" params={{ slug: product.slug }} className="hover:text-berry transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed hidden xs:block">{product.description}</p>
                <div className="mt-auto pt-2 sm:pt-3">
                  <QuickAdd product={product} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
        {products.map((product, i) => (
          <button
            key={product.id}
            type="button"
            aria-label={`Go to ${product.name}`}
            onClick={() => scrollToIndex(i)}
            className={
              i === active
                ? "h-1.5 sm:h-2 w-6 sm:w-8 rounded-full bg-berry transition-all duration-300"
                : "h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-berry/30 transition-all duration-300 hover:bg-berry/60"
            }
          />
        ))}
      </div>
    </div>
  );
}
