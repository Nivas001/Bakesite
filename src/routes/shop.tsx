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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-cocoa">The bakery counter</h1>
        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">
          Everything is baked in small batches on the morning of your slot.
        </p>
      </div>

      {/* Category Pills: Smooth horizontal swipe on mobile, wrap on tablet/desktop */}
      <div className="mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
        <Button
          variant={active === null ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs shrink-0 h-8 px-3.5"
          onClick={() => setActive(null)}
        >
          All
        </Button>
        {data.categories.map((category) => (
          <Button
            key={category.id}
            variant={active === category.slug ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs shrink-0 h-8 px-3.5"
            onClick={() => setActive(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Responsive Grid: 2 columns on mobile, 3 columns on tablet, 3-4 columns on desktop */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}