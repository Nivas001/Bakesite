import { Star, Heart, Camera, Sparkles } from "lucide-react";

export interface PolaroidMemory {
  id: string;
  image: string;
  customer: string;
  occasion: string;
  rating: number;
  note: string;
  rotation: string;
}

const MEMORIES: PolaroidMemory[] = [
  {
    id: "mem-1",
    image: "/cakes/pink-bento-cake.jpg",
    customer: "Priya & Karthik",
    occasion: "2nd Anniversary Celebration",
    rating: 5,
    note: "The strawberry mascarpone was heavenly! Not overly sweet, just pure cloud perfection.",
    rotation: "-rotate-2 hover:rotate-0 hover:scale-105",
  },
  {
    id: "mem-2",
    image: "/cakes/lavender-pearl-cake.jpg",
    customer: "Dr. Ananya S.",
    occasion: "Mum's 50th High-Tea Party",
    rating: 5,
    note: "The showstopper of our evening. Everyone thought it was flown in from Paris!",
    rotation: "rotate-2 hover:rotate-0 hover:scale-105",
  },
  {
    id: "mem-3",
    image: "/cakes/royal-gold-brownie.jpg",
    customer: "Rohan & Dev Team",
    occasion: "Product Launch Party",
    rating: 5,
    note: "Fudge brownie of our dreams. The gold chocolate spheres made the photos look unreal.",
    rotation: "-rotate-1 hover:rotate-0 hover:scale-105",
  },
  {
    id: "mem-4",
    image: "/cakes/biscoff-nut-brownie.jpg",
    customer: "Meera V.",
    occasion: "Family Sunday Feast",
    rating: 5,
    note: "Every single square had a distinct crunch. Pistachio + Biscoff was the unanimous winner!",
    rotation: "rotate-1 hover:rotate-0 hover:scale-105",
  },
];

export function PolaroidMomentsWall() {
  return (
    <section className="py-14 sm:py-20 overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-berry mb-2">
            <Heart className="size-3.5" />
            <span>Celebrated in Pondicherry</span>
          </div>
          <h2 className="font-nimbus text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
            Sweet moments from real tables
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            From midnight birthday surprises to intimate anniversary high-teas.
          </p>
        </div>

        {/* Polaroid Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {MEMORIES.map((memory) => (
            <div
              key={memory.id}
              className={`bg-card rounded-2xl p-3.5 pb-5 border border-border/80 shadow-soft transition-all duration-300 ${memory.rotation} cursor-pointer group flex flex-col justify-between`}
            >
              {/* Photo */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-secondary border border-border/50">
                <img
                  src={memory.image}
                  alt={memory.occasion}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white flex items-center gap-1">
                  <Camera className="size-2.5" />
                  <span>Customer Snap</span>
                </div>
              </div>

              {/* Polaroid Bottom Note */}
              <div className="mt-3.5 space-y-2">
                {/* 5-Star Rating */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: memory.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Handwritten Review Note */}
                <p className="font-script text-base text-foreground leading-snug">
                  "{memory.note}"
                </p>

                {/* Customer & Occasion */}
                <div className="pt-2 border-t border-border/50 text-[11px]">
                  <p className="font-bold text-cocoa">{memory.customer}</p>
                  <p className="text-muted-foreground">{memory.occasion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
