import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
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
  const { add } = useCart();
  const price = finalPrice(product.price, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

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
        <span className="absolute bottom-4 right-4 rounded-full bg-card/85 px-3 py-1 text-sm font-bold text-cocoa shadow-soft backdrop-blur">
          {formatCurrency(price)}
        </span>
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
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {discounted ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Fresh today</span>
          )}
          <Button
            className="rounded-2xl bg-berry px-6 text-berry-foreground shadow-soft transition-transform duration-200 hover:scale-105 hover:bg-berry/90 active:scale-95"
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
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}