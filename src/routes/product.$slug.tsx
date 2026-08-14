import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountLabel, finalPrice, formatCurrency, hasDiscount } from "@/lib/pricing";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: slug }),
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — Ani Bakes" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.product.name} — Ani Bakes Bakery`;
    const description =
      loaderData.product.description ?? "A small-batch bake from Ani Bakes Bakery.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!data) return null;
  const { product, related } = data;
  const price = finalPrice(product.price, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to the counter
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <img
          src={product.image_url ?? "/products/croissant.jpg"}
          alt={product.name}
          className="aspect-square w-full rounded-4xl object-cover shadow-soft"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category_name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-cocoa">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatCurrency(price)}</span>
            {discounted && (
              <>
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="rounded-full bg-berry px-3 py-1 text-xs font-semibold text-berry-foreground">
                  {discountLabel(product.discount_type, product.discount_value)}
                </span>
              </>
            )}
          </div>
          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                className="px-4 py-2 text-lg"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                className="px-4 py-2 text-lg"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              className="bg-berry text-berry-foreground hover:bg-berry/90"
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
                  quantity,
                );
                toast.success(`${product.name} added to cart`);
              }}
            >
              Add to cart
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Baked the morning of your chosen slot. Orders need at least one day of notice.
          </p>
        </div>
      </div>

      <ProductReviews productId={product.id} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-cocoa">You might also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}