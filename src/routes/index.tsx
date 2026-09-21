import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { HeroRevampSection } from "@/components/hero-revamp-section";
import { AssuranceStrip } from "@/components/home/assurance-strip";
import { CravingExplorer } from "@/components/home/craving-explorer";
import { ProductFilm } from "@/components/home/product-film";
import { BakeSequence } from "@/components/home/bake-sequence";
import { DailyCounter } from "@/components/home/daily-counter";
import { HowItWorks } from "@/components/home/how-it-works";
import { CraftPromise } from "@/components/home/craft-promise";
import { HomeFaq } from "@/components/home/home-faq";
import { ClosingCta } from "@/components/home/closing-cta";
import { CakeStudioCarousel } from "@/components/cake-studio-carousel";
import { CakeBuilderWidget } from "@/components/cake-builder-widget";
import { PolaroidMomentsWall } from "@/components/polaroid-moments-wall";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aniii Bakes Bakery — Fresh small-batch cakes & cookies" },
      {
        name: "description",
        content:
          "Handcrafted small-batch bakery in Pondicherry. Fresh cakes, cookies, breads, and pastries baked the morning of your slot.",
      },
      {
        property: "og:title",
        content: "Aniii Bakes Bakery — Fresh small-batch cakes & cookies",
      },
      {
        property: "og:description",
        content: "Artisanal bakes made the morning of your slot. Delivery or pickup.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

/**
 * Homepage running order.
 *
 * The page used to open with six editorial bands — a fermentation laboratory, a
 * hydration table — before a visitor met a single category name or a price. The
 * order below answers a first-time visitor's questions in the order they ask
 * them: can I trust this, what do you sell, what is good today, how do I order,
 * can you do my cake, why you, who else buys here.
 *
 * The film sits after the explorer: by then a visitor knows what is sold, so a
 * pinned four-screen sequence reads as an invitation to linger rather than as
 * an obstacle between them and the menu.
 */
function Home() {
  const { data } = useSuspenseQuery(catalogQuery);

  return (
    <div className="w-full overflow-x-clip">
      <HeroRevampSection />

      <div className="w-full space-y-10 pt-6 sm:space-y-16 sm:pt-10">
        <AssuranceStrip />
        <CravingExplorer categories={data.categories} products={data.products} />
        <ProductFilm />
        <BakeSequence />
        <DailyCounter products={data.products} />
        <HowItWorks />
        <CakeStudioCarousel />
        <CakeBuilderWidget />
        <CraftPromise />
        <PolaroidMomentsWall />
        <HomeFaq />
        <ClosingCta />
      </div>
    </div>
  );
}
