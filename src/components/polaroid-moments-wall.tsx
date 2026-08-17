import { Heart, Sparkles } from "lucide-react";
import { AccordionGallery, type AccordionGalleryItem } from "@/components/ui/accordion-gallery";
import { useCustomerMoments } from "@/lib/customer-moments";

export function PolaroidMomentsWall() {
  const { activeMoments } = useCustomerMoments();

  const galleryItems: AccordionGalleryItem[] = activeMoments.map((moment) => ({
    image: moment.image,
    customer: moment.customer,
    occasion: moment.occasion,
    note: moment.note,
    rating: moment.rating || 5,
    alt: `${moment.customer} - ${moment.occasion}`,
  }));

  return (
    <section className="py-12 sm:py-18 overflow-hidden bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-berry mb-2">
            <Heart className="size-3.5" />
            <span>Celebrated in Pondicherry</span>
          </div>
          <h2 className="font-nimbus text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
            Sweet moments from real tables
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-sans">
            Wipe or tap to explore midnight birthday surprises and intimate anniversary high-teas.
          </p>
        </div>

        {/* React Bits AccordionGallery with GSAP */}
        <div className="w-full">
          {galleryItems.length > 0 ? (
            <AccordionGallery
              items={galleryItems}
              defaultIndex={0}
              expandRatio={0.52}
              trigger="hover"
              height={460}
              gap={12}
              radius={20}
              grayscale={false}
              accentColor="#f59e0b"
              overlayColor="#150914"
              textColor="#ffffff"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No customer moments available.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default PolaroidMomentsWall;
