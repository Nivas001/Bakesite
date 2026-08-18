import { useState, useRef, useCallback } from "react";
import { Heart, Star, ChevronLeft, ChevronRight, Sparkles, Quote } from "lucide-react";
import { AccordionGallery, type AccordionGalleryItem } from "@/components/ui/accordion-gallery";
import { useCustomerMoments } from "@/lib/customer-moments";

export function PolaroidMomentsWall() {
  const { activeMoments } = useCustomerMoments();
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const galleryItems: AccordionGalleryItem[] = activeMoments.map((moment) => ({
    image: moment.image,
    customer: moment.customer,
    occasion: moment.occasion,
    note: moment.note,
    rating: moment.rating || 5,
    alt: `${moment.customer} - ${moment.occasion}`,
  }));

  const handleNext = useCallback(() => {
    if (!activeMoments.length) return;
    setMobileIndex((prev) => (prev + 1) % activeMoments.length);
  }, [activeMoments.length]);

  const handlePrev = useCallback(() => {
    if (!activeMoments.length) return;
    setMobileIndex((prev) => (prev - 1 + activeMoments.length) % activeMoments.length);
  }, [activeMoments.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? null;
    if (touchEndX === null) return;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const currentMoment = activeMoments[mobileIndex] || activeMoments[0];

  return (
    <section className="py-10 sm:py-16 overflow-hidden bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-berry mb-2">
            <Heart className="size-3.5" />
            <span>Celebrated in Pondicherry</span>
          </div>
          <h2 className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight uppercase tracking-wide">
            Sweet moments from real tables
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-sans">
            Wipe or tap to explore midnight birthday surprises and intimate anniversary high-teas.
          </p>
        </div>

        {/* 📱 MOBILE VIEW: Automated Carousel Card with 1-Click Next Navigation & Touch Swipe (<640px) */}
        {activeMoments.length > 0 && currentMoment && (
          <div className="block sm:hidden">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft"
            >
              {/* Photo Showcase (Aspect 16/11) */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-secondary/30">
                <img
                  key={currentMoment.image}
                  src={currentMoment.image}
                  alt={`${currentMoment.customer} celebration`}
                  className="size-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 pointer-events-none" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 border border-white/20 text-amber-300 text-xs font-bold shadow-xs">
                  <Star className="size-3 fill-amber-300 text-amber-300" />
                  <span>5.0</span>
                </div>

                {/* Occasion Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-berry border border-border/60 shadow-2xs">
                    <Sparkles className="size-2.5" />
                    {currentMoment.occasion}
                  </span>
                </div>

                {/* Left & Right Step Arrows on Image */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous review moment"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next review moment"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>

                {/* Customer name overlaid at base of image */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <p className="font-blogh text-sm font-bold text-white uppercase tracking-wider truncate">
                    {currentMoment.customer}
                  </p>
                </div>
              </div>

              {/* Review Note Body */}
              <div className="p-4 space-y-3 bg-card">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Quote className="size-4 text-berry shrink-0 rotate-180 opacity-60" />
                  <p className="text-xs italic text-foreground leading-relaxed">
                    "{currentMoment.note}"
                  </p>
                </div>

                {/* Bottom Navigation & Counter Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  {/* Bullet Dot Indicators */}
                  <div className="flex items-center gap-1.5">
                    {activeMoments.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        aria-label={`Jump to review ${idx + 1}`}
                        onClick={() => setMobileIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          mobileIndex === idx ? "w-5 bg-berry shadow-2xs" : "w-1.5 bg-border/80"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Next Step Action Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 text-xs font-bold text-berry hover:text-berry/80 cursor-pointer"
                  >
                    <span>Next moment</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🖥️ TABLET & DESKTOP VIEW: GSAP Accordion Gallery (>=640px) */}
        <div className="hidden sm:block w-full">
          {galleryItems.length > 0 ? (
            <AccordionGallery
              items={galleryItems}
              defaultIndex={0}
              expandRatio={0.72}
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
