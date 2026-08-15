import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <article className="glass-panel group flex flex-col rounded-[2.25rem] p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-lift">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-[1.75rem]"
      >
        <img
          src={product.image_url ?? "/products/croissant.jpg"}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

      <div className="flex flex-1 flex-col gap-3 px-2 pb-1 pt-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category_name}
          </p>
          <h3 className="font-display text-lg font-semibold leading-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        {/* Bottom Action: Add or Quantity Stepper */}
        <div className="mt-auto pt-2">
          {quantityInCart === 0 ? (
            <Button
              size="sm"
              className="h-9 w-full rounded-xl bg-berry text-berry-foreground text-xs font-medium shadow-xs transition-all duration-200 hover:scale-[1.01] hover:bg-berry/90 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
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
              <Plus className="size-3.5" />
              <span>Add to cart</span>
            </Button>
          ) : (
            <div className="flex h-9 w-full items-center justify-between rounded-xl bg-secondary/50 p-1 border border-border/60 shadow-2xs">
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                className="flex size-7 items-center justify-center rounded-lg bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer"
                onClick={() => {
                  setQuantity(product.id, quantityInCart - 1);
                  if (quantityInCart - 1 === 0) {
                    toast.info(`Removed ${product.name} from cart`);
                  }
                }}
              >
                <Minus className="size-3" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <ShoppingBag className="size-3 text-berry" />
                <span className="text-xs font-semibold text-cocoa tabular-nums">
                  {quantityInCart} in cart
                </span>
              </div>

              <button
                type="button"
                aria-label={`Increase ${product.name} quantity`}
                className="flex size-7 items-center justify-center rounded-lg bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer"
                onClick={() => {
                  setQuantity(product.id, Math.min(30, quantityInCart + 1));
                }}
              >
                <Plus className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}