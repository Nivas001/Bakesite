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
  const price = finalPrice(product.price, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  const cartLine = lines.find((l) => l.productId === product.id);
  const quantityInCart = cartLine?.quantity ?? 0;

  return (
    <article className="glass-panel group flex flex-col rounded-[1.35rem] sm:rounded-[1.75rem] md:rounded-[2rem] p-2.5 sm:p-3.5 md:p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-[1rem] sm:rounded-[1.35rem]"
      >
        <img
          src={product.image_url ?? "/products/croissant.jpg"}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discounted && (
          <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full bg-berry px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-berry-foreground shadow-soft">
            {discountLabel(product.discount_type, product.discount_value)}
          </span>
        )}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex flex-col items-end">
          {discounted && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/90 line-through drop-shadow-xs mb-0.5">
              {formatCurrency(product.price)}
            </span>
          )}
          <span className="rounded-full bg-card/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs md:text-sm font-bold text-cocoa shadow-soft backdrop-blur">
            {formatCurrency(price)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 sm:gap-2.5 px-1 sm:px-2 pb-0.5 pt-3 sm:pt-4">
        <div>
          <p className="text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/90 line-clamp-1">
            {product.category_name}
          </p>
          <h3 className="font-blogh uppercase tracking-wide text-xs sm:text-base font-bold leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5 text-cocoa">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-berry transition-colors">
              {product.name}
            </Link>
          </h3>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-[10px] sm:text-xs text-muted-foreground leading-relaxed hidden xs:block">
            {product.description}
          </p>
        )}

        {/* Bottom Action: Aligned to Full Right */}
        <div className="mt-auto pt-1.5 sm:pt-2 flex items-center justify-end">
          {quantityInCart === 0 ? (
            <button
              type="button"
              className="inline-flex h-7 sm:h-8 items-center justify-center gap-1 rounded-full bg-berry px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-semibold text-berry-foreground shadow-xs transition-all duration-200 hover:scale-105 hover:bg-berry/90 active:scale-95 cursor-pointer ml-auto"
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