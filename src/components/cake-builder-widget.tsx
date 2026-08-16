import { useState } from "react";
import { Sparkles, MessageCircle, Heart, Check, Cake, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIZES = [
  {
    id: "bento",
    name: '4" Bento Cake',
    desc: "Feeds 2–3 · Cute & intimate",
    basePrice: 550,
    icon: "🧁",
  },
  {
    id: "layer6",
    name: '6" Layer Cake',
    desc: "Feeds 6–8 · Party showstopper",
    basePrice: 1250,
    icon: "🎂",
  },
  {
    id: "feast8",
    name: '8" Feast Tier',
    desc: "Feeds 12–16 · Grand feast",
    basePrice: 1850,
    icon: "👑",
  },
  {
    id: "slab",
    name: "Brownie Slab",
    desc: "Feeds 10–14 · Rich fudge mosaic",
    basePrice: 1450,
    icon: "🍫",
  },
];

const FLAVORS = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped Mascarpone",
    accentBg: "bg-pink-100 dark:bg-pink-950/40",
    cakeBg: "bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 dark:from-pink-900 dark:to-rose-950",
    textColor: "text-rose-700 dark:text-rose-200",
    border: "border-pink-300 dark:border-pink-800",
    dotColor: "bg-rose-400",
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark Cocoa Ganache",
    accentBg: "bg-amber-100 dark:bg-amber-950/40",
    cakeBg: "bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950 text-white",
    textColor: "text-amber-300",
    border: "border-amber-700 dark:border-amber-700",
    dotColor: "bg-amber-400",
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French Buttercream",
    accentBg: "bg-purple-100 dark:bg-purple-950/40",
    cakeBg: "bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-300 dark:from-purple-900 dark:to-indigo-950",
    textColor: "text-purple-800 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-800",
    dotColor: "bg-purple-400",
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Lotus Cookie Butter",
    accentBg: "bg-orange-100 dark:bg-orange-950/40",
    cakeBg: "bg-gradient-to-br from-amber-200 via-orange-100 to-amber-300 dark:from-amber-900 dark:to-orange-950",
    textColor: "text-amber-900 dark:text-amber-100",
    border: "border-orange-300 dark:border-orange-800",
    dotColor: "bg-orange-400",
  },
];

export function CakeBuilderWidget() {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]!);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]!);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeMessage, setCakeMessage] = useState("Tummy the Main Character");

  const totalEstimate = selectedSize.basePrice;

  const whatsappText = encodeURIComponent(
    `Hi Ani Bakes! 🎂 I built a custom celebration cake on your website simulator:\n` +
      `• Canvas: ${selectedSize.name} (${selectedSize.desc})\n` +
      `• Flavour: ${selectedFlavor.name} (${selectedFlavor.cream})\n` +
      `• Dietary: ${isEggless ? "100% Eggless" : "Standard Free-Range Egg"}\n` +
      `• Custom Cake Message: "${cakeMessage || "No Message"}"\n` +
      `• Est. Price: ₹${totalEstimate}\n\n` +
      `Can you confirm baking slot availability?`
  );

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
            <Wand2 className="size-3.5" />
            <span>Interactive Cake Simulator</span>
          </div>
          <h2 className="font-nimbus text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
            Design your dream celebration bake
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Pair sponges, choose artisan fillings, and see your custom message rendered live before ordering.
          </p>
        </div>

        {/* 2-Column Interactive Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-soft">
            
            {/* Step 1: Canvas / Size */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <span>1. Select Cake Canvas & Size</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-2xs"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{size.icon}</span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-cocoa text-background">
                            <Check className="size-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-xs sm:text-sm text-foreground">{size.name}</p>
                        <p className="text-[10px] text-muted-foreground">{size.desc}</p>
                        <p className="text-xs font-extrabold text-cocoa mt-1">₹{size.basePrice}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Flavor Pairing */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <span>2. Choose Flavour & Buttercream Pairing</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-2xs"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`size-2.5 rounded-full ${flavor.dotColor}`} />
                          <span className="font-bold text-xs text-foreground">{flavor.name}</span>
                        </div>
                        {isSelected && <Check className="size-3 text-cocoa" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {flavor.cream}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Dietary Toggle & Custom Message */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              {/* Eggless switch */}
              <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3 border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground">Dietary Preference</p>
                  <p className="text-[10px] text-muted-foreground">
                    100% vegetarian & eggless sponge available with zero texture compromise
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEggless(!isEggless)}
                  className={`rounded-full px-3 py-1 text-xs font-extrabold border transition-all cursor-pointer ${
                    isEggless
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {isEggless ? "✓ 100% Eggless" : "Standard Egg"}
                </button>
              </div>

              {/* Custom Message on Cake */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="cake-message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    3. Custom Pipe Message on Cake
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {cakeMessage.length}/35 chars
                  </span>
                </div>
                <input
                  id="cake-message"
                  type="text"
                  maxLength={35}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday Maya 💕"
                  className="h-10 w-full rounded-2xl border border-input bg-background/80 px-4 text-xs sm:text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cocoa/30"
                />
              </div>
            </div>

          </div>

          {/* Live Preview Canvas Column (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-lift overflow-hidden relative">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Studio Preview
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  <Sparkles className="size-2.5" /> Real-time render
                </span>
              </div>

              {/* Stylized Visual Cake Canvas */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div
                  className={`relative size-56 sm:size-64 rounded-full ${selectedFlavor.cakeBg} ${selectedFlavor.border} border-4 shadow-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:scale-105 select-none`}
                >
                  {/* Decorative frosting piped hearts & sprinkles */}
                  <div className="absolute top-4 left-6 text-xs animate-pulse">💕</div>
                  <div className="absolute top-6 right-8 text-xs animate-bounce">✨</div>
                  <div className="absolute bottom-5 left-10 text-xs">🍓</div>
                  <div className="absolute bottom-6 right-8 text-xs">🌸</div>

                  {/* Inner Frosting Center Plaque */}
                  <div className="w-full rounded-2xl bg-white/75 dark:bg-black/60 backdrop-blur-xs p-3.5 border border-white/40 shadow-sm flex flex-col items-center justify-center">
                    <p className={`font-script text-xl sm:text-2xl font-bold leading-snug break-words max-w-full ${selectedFlavor.textColor}`}>
                      {cakeMessage.trim() ? cakeMessage : "Your message here"}
                    </p>
                  </div>

                  {/* Cake Base Label */}
                  <span className="absolute bottom-2 rounded-full bg-black/40 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    {selectedSize.name}
                  </span>
                </div>
              </div>

              {/* Recipe Summary */}
              <div className="rounded-2xl bg-secondary/40 p-3.5 border border-border/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Size:</span>
                  <span className="font-bold text-foreground">{selectedSize.name}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Flavour:</span>
                  <span className="font-bold text-foreground">{selectedFlavor.name}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Dietary:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isEggless ? "100% Eggless Sponge" : "Standard Farm Egg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Estimate & Order Action */}
            <div className="pt-4 border-t border-border/60 mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Estimated Price
                  </p>
                  <p className="font-sans text-2xl font-black text-cocoa tracking-tight">
                    ₹{totalEstimate}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Includes custom piping & gift packaging
                </span>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs shadow-lift h-11 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <a
                  href={`https://wa.me/917448724920?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>Order Custom Cake with this Design</span>
                </a>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
