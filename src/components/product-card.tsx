import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  discountLabel,
  finalPrice,
  formatCurrency,
  hasDiscount,
  type CatalogProduct,
} from "@/lib/pricing";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { lines, add, setQuantity } = useCart();
  const hasVariants = Boolean(product.weight_variants && product.weight_variants.length > 0);
  const defaultVariant = hasVariants ? product.weight_variants![0] : null;
  const displayBasePrice = defaultVariant ? defaultVariant.price : product.price;
  const price = finalPrice(displayBasePrice, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  const cartLine = lines.find((l) => l.productId === product.id);
  const quantityInCart = cartLine?.quantity ?? 0;

  return (
    <article className="group flex flex-col justify-between h-full rounded-[1.6rem] sm:rounded-[2rem] border-2 border-[#2C1810]/15 hover:border-[#2C1810]/40 bg-[#FFFDF9] dark:bg-[#1E110A] p-3 sm:p-4 shadow-[0_6px_20px_rgba(44,24,16,0.06)] hover:shadow-[0_12px_28px_rgba(44,24,16,0.12)] transition-all duration-300 hover:-translate-y-1">
      {/* Top Product Image */}
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-black/10 bg-black/5 shrink-0"
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
          <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full bg-berry px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-berry-foreground shadow-soft">
            {discountLabel(product.discount_type, product.discount_value)}
          </span>
        )}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex flex-col items-end">
          {discounted && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/90 line-through drop-shadow-xs mb-0.5">
              {formatCurrency(displayBasePrice)}
            </span>
          )}
          <span className="rounded-full bg-card/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs md:text-sm font-bold text-cocoa shadow-soft backdrop-blur">
            {hasVariants ? `From ` : ""}{formatCurrency(price)}
          </span>
        </div>
      </Link>

      {/* Card Content (Structured with equal-height slots for seamless horizontal alignment) */}
      <div className="flex flex-1 flex-col justify-between px-0.5 sm:px-1 pt-2.5 sm:pt-3">
        <div className="flex flex-col">
          {/* Category & Weight Row */}
          <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] h-4">
            <p className="uppercase tracking-wider font-bold text-muted-foreground/90 truncate">
              {product.category_name}
            </p>
            {(product.serving_yield || product.unit_weight_grams) && (
              <span className="font-semibold text-berry shrink-0">
                {product.unit_weight_grams ? `${product.unit_weight_grams}g` : product.serving_yield}
              </span>
            )}
          </div>

          {/* Product Name (Strict 2-Line Fixed Height Box so 1-line and 2-line titles align identically) */}
          <h3 className="font-blogh uppercase tracking-wide text-xs sm:text-sm font-bold leading-snug line-clamp-2 mt-1 text-cocoa h-[2.25rem] sm:h-[2.6rem] flex items-start">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-berry transition-colors">
              {product.name}
            </Link>
          </h3>

          {/* Weight Variants / Description Slot (Consistent height so buttons are at the same baseline) */}
          <div className="h-6 sm:h-7 mt-1 flex items-center overflow-hidden">
            {hasVariants ? (
              <div className="flex flex-wrap items-center gap-1">
                {product.weight_variants!.slice(0, 3).map((v) => (
                  <span
                    key={v.id}
                    className="inline-block rounded-md bg-secondary/80 px-1.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-muted-foreground border border-border/50 shrink-0"
                  >
                    {v.label.split(" ")[0]}
                  </span>
                ))}
                {product.weight_variants!.length > 3 && (
                  <span className="text-[8.5px] sm:text-[9px] text-muted-foreground font-bold shrink-0">
                    +{product.weight_variants!.length - 3} more
                  </span>
                )}
              </div>
            ) : product.description ? (
              <p className="text-[9.5px] sm:text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                {product.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bottom Action: Aligned to Full Right with consistent height */}
        <div className="mt-auto pt-2 flex items-center justify-end h-8 sm:h-9">
          {quantityInCart === 0 ? (
            <button
              type="button"
              className="inline-flex h-7 sm:h-8 items-center justify-center gap-1 rounded-full bg-berry px-2.5 sm:px-3.5 text-[10.5px] sm:text-xs font-semibold text-berry-foreground shadow-xs transition-all duration-200 hover:scale-105 hover:bg-berry/90 active:scale-95 cursor-pointer ml-auto"
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
            <div className="inline-flex h-7 sm:h-8 items-center gap-1 sm:gap-1.5 rounded-full bg-secondary/80 px-1 sm:px-1.5 py-0.5 border border-border/70 shadow-2xs ml-auto">
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer"
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
                className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer"
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
  );
}