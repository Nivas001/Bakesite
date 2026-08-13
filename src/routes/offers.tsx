import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { hasDiscount } from "@/lib/pricing";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bakery offers — Sweet Crumb Bakery" },
      {
        name: "description",
        content: "Discounted cakes, cookies and pastries at Sweet Crumb, updated every week.",
      },
      { property: "og:title", content: "Bakery offers — Sweet Crumb Bakery" },
      { property: "og:description", content: "This week's discounted bakes at Sweet Crumb." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Offers,
});

function Offers() {
  const { data } = useSuspenseQuery(catalogQuery);
  const offers = data.products.filter((p) => hasDiscount(p.discount_type, p.discount_value));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-cocoa">This week&apos;s offers</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        A rotating handful of bakes at a friendlier price. Same batch, same morning.
      </p>

      {offers.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          No offers right now —{" "}
          <Link to="/shop" className="text-berry hover:underline">
            browse the full counter
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}