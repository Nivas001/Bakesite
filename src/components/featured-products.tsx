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
    <div className="flex items-center gap-2">
      <div className="glass-soft flex items-center gap-1 rounded-2xl p-1">
        <button
          type="button"
          aria-label={`Decrease ${product.name} quantity`}
          className="grid size-8 place-items-center rounded-xl text-cocoa transition hover:bg-card/70 active:scale-90"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums text-cocoa">{qty}</span>
        <button
          type="button"
          aria-label={`Increase ${product.name} quantity`}
          className="grid size-8 place-items-center rounded-xl text-cocoa transition hover:bg-card/70 active:scale-90"
          onClick={() => setQty((q) => Math.min(20, q + 1))}
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button
        className="flex-1 rounded-2xl bg-berry text-berry-foreground shadow-soft transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95"
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
        <ShoppingBag className="mr-2 size-4" />
        Quick add
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
    <div className="relative mt-8 sm:mt-10">
      <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => scrollToIndex(Math.max(0, active - 1))}
          className="glass-soft pointer-events-auto grid size-11 place-items-center rounded-full text-cocoa shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95 disabled:opacity-40"
          disabled={active === 0}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next products"
          onClick={() => scrollToIndex(Math.min(products.length - 1, active + 1))}
          className="glass-soft pointer-events-auto grid size-11 place-items-center rounded-full text-cocoa shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95 disabled:opacity-40"
          disabled={active === products.length - 1}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 sm:gap-6"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => {
          const price = finalPrice(product.price, product.discount_type, product.discount_value);
          const discounted = hasDiscount(product.discount_type, product.discount_value);
          return (
            <article
              key={product.id}
              className="glass-panel group flex w-[85%] shrink-0 snap-start flex-col rounded-[1.5rem] p-3 transition-all duration-500 hover:-translate-y-2 hover:shadow-lift sm:w-[46%] sm:rounded-[2.25rem] sm:p-4 lg:w-[31.5%]"
            >
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="relative block overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem]"
              >
                <img
                  src={product.image_url ?? "/products/croissant.jpg"}
                  alt={product.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  draggable={false}
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {discounted && (
                  <span className="absolute left-4 top-4 rounded-full bg-berry px-3 py-1 text-xs font-semibold text-berry-foreground shadow-soft">
                    {discountLabel(product.discount_type, product.discount_value)}
                  </span>
                )}
                <div className="absolute bottom-3 right-3 flex flex-col items-end">
                  {discounted && (
                    <span className="text-[11px] font-semibold text-foreground/80 line-through drop-shadow-xs mb-0.5">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  <span className="rounded-full bg-card/90 px-3 py-1 text-sm font-bold text-cocoa shadow-soft backdrop-blur">
                    {formatCurrency(price)}
                  </span>
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-1 pt-4 sm:gap-3 sm:pt-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {product.category_name}
                </p>
                <h3 className="font-display text-lg font-semibold leading-tight">
                  <Link to="/product/$slug" params={{ slug: product.slug }}>
                    {product.name}
                  </Link>
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-auto pt-4">
                  <QuickAdd product={product} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {products.map((product, i) => (
          <button
            key={product.id}
            type="button"
            aria-label={`Go to ${product.name}`}
            onClick={() => scrollToIndex(i)}
            className={
              i === active
                ? "h-2 w-8 rounded-full bg-berry transition-all duration-300"
                : "h-2 w-2 rounded-full bg-berry/30 transition-all duration-300 hover:bg-berry/60"
            }
          />
        ))}
      </div>
    </div>
  );
}
