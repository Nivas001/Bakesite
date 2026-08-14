import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop all bakes — Ani Bakes Bakery" },
      {
        name: "description",
        content: "Browse cakes, cookies and pastries from Ani Bakes, baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop all bakes — Ani Bakes Bakery" },
      { property: "og:description", content: "Cakes, cookies and pastries baked fresh to order." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [active, setActive] = useState<string | null>(null);
  const products = active
    ? data.products.filter((p) => p.category_slug === active)
    : data.products;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-cocoa">The bakery counter</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Everything is baked in small batches on the morning of your slot.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          variant={active === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActive(null)}
        >
          All
        </Button>
        {data.categories.map((category) => (
          <Button
            key={category.id}
            variant={active === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}