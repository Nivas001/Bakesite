import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { ProductQuickView } from "@/components/product-quick-view";
import {
  customerDescription,
  discountLabel,
  finalPrice,
  formatCurrency,
  hasDiscount,
  type CatalogProduct,
} from "@/lib/pricing";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { lines, add, setQuantity } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const hasVariants = Boolean(product.weight_variants && product.weight_variants.length > 0);
  const defaultVariant = hasVariants ? product.weight_variants![0]! : null;
  const displayBasePrice = defaultVariant ? defaultVariant.price : product.price;
  const price = finalPrice(displayBasePrice, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  const description = customerDescription(product.description);
  const cartLine = lines.find((l) => l.productId === product.id);
  const quantityInCart = cartLine?.quantity ?? 0;

  return (
    <>
      <article className="group flex h-full flex-col justify-between rounded-[1.6rem] border-2 border-[#2C1810]/15 bg-[#FFFDF9] p-3 shadow-[0_6px_20px_rgba(44,24,16,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2C1810]/40 hover:shadow-[0_12px_28px_rgba(44,24,16,0.12)] sm:rounded-[2rem] sm:p-4 dark:bg-[#1E110A]">
        {/* Top Product Image */}
        <div className="relative shrink-0">
          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            className="relative block overflow-hidden rounded-[1.25rem] border border-black/10 bg-black/5 sm:rounded-[1.5rem]"
          >
            <img
              src={product.image_url ?? "/products/croissant.jpg"}
              alt={product.name}
              loading="lazy"
              width={600}
              height={600}
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {discounted && (
              <span className="absolute top-2.5 left-2.5 rounded-full bg-berry px-2 py-0.5 text-[11px] font-semibold text-berry-foreground shadow-soft sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs">
                {discountLabel(product.discount_type, product.discount_value)}
              </span>
            )}
            {/* Both prices sit inside one backdrop. Previously the struck-through
                price floated bare on the photograph just above the pill, where it
                collided with it and was often unreadable against the image. */}
            <div className="absolute right-2.5 bottom-2.5 sm:right-3 sm:bottom-3">
              <span className="inline-flex items-baseline gap-1.5 rounded-full bg-card/92 px-2.5 py-1 shadow-soft backdrop-blur">
                {discounted && (
                  <s className="text-[11px] font-semibold text-muted-foreground">
                    <span className="sr-only">Was </span>
                    {formatCurrency(displayBasePrice)}
                  </s>
                )}
                <span className="text-[11px] font-bold text-cocoa sm:text-xs md:text-sm">
                  {hasVariants ? `From ` : ""}
                  {formatCurrency(price)}
                </span>
              </span>
            </div>
          </Link>

          {/* Quick view sits outside the link so it does not navigate. Always
              visible on touch, where there is no hover to reveal it. */}
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Quick view ${product.name}`}
            className="absolute top-2.5 right-2.5 grid size-8 cursor-pointer place-items-center rounded-full bg-card/90 text-cocoa shadow-soft backdrop-blur transition-all hover:scale-105 hover:text-berry-deep active:scale-95 sm:top-3 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Eye className="size-4" />
          </button>
        </div>

        {/* Card Content (Structured with equal-height slots for seamless horizontal alignment) */}
        <div className="flex flex-1 flex-col justify-between px-0.5 pt-2.5 sm:px-1 sm:pt-3">
          <div className="flex flex-col">
            {/* Category & Weight Row */}
            <div className="flex h-4 items-center justify-between gap-1 text-[11px]">
              <p className="truncate font-bold tracking-wider text-muted-foreground/90 uppercase">
                {product.category_name}
              </p>
              {(product.serving_yield || product.unit_weight_grams) && (
                <span className="shrink-0 font-semibold text-berry-deep">
                  {product.unit_weight_grams
                    ? `${product.unit_weight_grams}g`
                    : product.serving_yield}
                </span>
              )}
            </div>

            {/* Product Name (Strict 2-Line Fixed Height Box so 1-line and 2-line titles align identically) */}
            <h3 className="mt-1 flex h-[2.25rem] items-start font-blogh text-xs leading-snug font-bold tracking-wide text-cocoa uppercase line-clamp-2 sm:h-[2.6rem] sm:text-sm">
              <Link
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="transition-colors hover:text-berry-deep"
              >
                {product.name}
              </Link>
            </h3>

            {/* Weight Variants / Description Slot (Consistent height so buttons are at the same baseline) */}
            <div className="mt-1 flex h-6 items-center overflow-hidden sm:h-7">
              {hasVariants ? (
                <div className="flex flex-wrap items-center gap-1">
                  {product.weight_variants!.slice(0, 3).map((v) => (
                    <span
                      key={v.id}
                      className="inline-block shrink-0 rounded-md border border-border/50 bg-secondary/80 px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground"
                    >
                      {v.label.split(" ")[0]}
                    </span>
                  ))}
                  {product.weight_variants!.length > 3 && (
                    <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                      +{product.weight_variants!.length - 3} more
                    </span>
                  )}
                </div>
              ) : description ? (
                <p className="text-[11px] leading-normal text-muted-foreground line-clamp-1">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Bottom Action: Aligned to Full Right with consistent height */}
          <div className="mt-auto flex h-8 items-center justify-end pt-2 sm:h-9">
            {hasVariants ? (
              <button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                className="ml-auto inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-full bg-cocoa px-2.5 text-[11px] font-semibold text-background shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 sm:h-8 sm:px-3.5 sm:text-xs"
              >
                <span>Choose size</span>
              </button>
            ) : quantityInCart === 0 ? (
              <button
                type="button"
                className="ml-auto inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-full bg-berry px-2.5 text-[11px] font-semibold text-berry-foreground shadow-xs transition-all duration-200 hover:scale-105 hover:bg-berry/90 active:scale-95 sm:h-8 sm:px-3.5 sm:text-xs"
                onClick={() => {
                  add({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    unitPrice: price,
                    basePrice: product.price,
                    imageUrl: product.image_url,
                  });
                  toast.success(`${product.name} added to cart`);
                }}
              >
                <Plus className="size-3 sm:size-3.5" />
                <span>Add to cart</span>
              </button>
            ) : (
              <div className="ml-auto inline-flex h-7 items-center gap-1 rounded-full border border-border/70 bg-secondary/80 px-1 py-0.5 shadow-2xs sm:h-8 sm:gap-1.5 sm:px-1.5">
                <button
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  className="flex size-5.5 cursor-pointer items-center justify-center rounded-full bg-card text-foreground shadow-2xs transition-all hover:bg-background active:scale-90 sm:size-6"
                  onClick={() => {
                    setQuantity(product.id, quantityInCart - 1);
                    if (quantityInCart - 1 === 0) {
                      toast.info(`Removed ${product.name} from cart`);
                    }
                  }}
                >
                  <Minus className="size-2.5 sm:size-3" />
                </button>

                <span className="min-w-4 px-1 text-center text-xs font-bold text-cocoa tabular-nums">
                  {quantityInCart}
                </span>

                <button
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  className="flex size-5.5 cursor-pointer items-center justify-center rounded-full bg-berry text-berry-foreground shadow-2xs transition-all hover:bg-berry/90 active:scale-90 sm:size-6"
                  onClick={() => {
                    setQuantity(product.id, Math.min(30, quantityInCart + 1));
                  }}
                >
                  <Plus className="size-2.5 sm:size-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      <ProductQuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}
