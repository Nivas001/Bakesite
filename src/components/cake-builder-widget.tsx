import { useState } from "react";
import { Sparkles, MessageCircle, Check, Wand2, Users, Heart, ShieldCheck, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SizeOption {
  id: string;
  name: string;
  serves: string;
  basePrice: number;
  icon: string;
}

interface FlavorOption {
  id: string;
  name: string;
  cream: string;
  image: string;
  badge: string;
  accent: string;
}

const SIZES: SizeOption[] = [
  {
    id: "bento",
    name: '4" Bento Cake',
    serves: "2–3 Guests",
    basePrice: 550,
    icon: "🧁",
  },
  {
    id: "layer6",
    name: '6" Layer Cake',
    serves: "6–8 Guests",
    basePrice: 1250,
    icon: "🎂",
  },
  {
    id: "feast8",
    name: '8" Grand Feast',
    serves: "12–16 Guests",
    basePrice: 1850,
    icon: "👑",
  },
  {
    id: "slab",
    name: "Brownie Feast Slab",
    serves: "10–14 Guests",
    basePrice: 1450,
    icon: "🍫",
  },
];

const SPONGES = [
  { id: "chiffon", name: "Fluffy Chiffon", desc: "Airy & light" },
  { id: "butter", name: "Heritage Butter", desc: "Velvety crumb" },
  { id: "fudge", name: "Belgian Dark Fudge", desc: "Rich chocolate" },
];

const FLAVORS: FlavorOption[] = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped Berry Mascarpone",
    image: "/cakes/pink-bento-cake.jpg",
    badge: "Signature Romance",
    accent: "bg-rose-500",
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark Cocoa Ganache Drip",
    image: "/cakes/belgian-truffle-cake.jpg",
    badge: "Rich Decadence",
    accent: "bg-amber-600",
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French Buttercream & Berries",
    image: "/cakes/butterfly-lilac-cake.jpg",
    badge: "Artisan Floral",
    accent: "bg-purple-500",
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Caramel Lotus Feathering",
    image: "/cakes/biscoff-herringbone-cake.jpg",
    badge: "Celebration Crunch",
    accent: "bg-orange-500",
  },
];

const DECOR_ADDONS = [
  { id: "berries", name: "Fresh Berries", price: 100, icon: "🍓" },
  { id: "gold", name: "24K Gold Leaf", price: 120, icon: "✨" },
  { id: "blossoms", name: "Buttercream Blossoms", price: 80, icon: "🌸" },
  { id: "pearls", name: "Sugar Pearls", price: 50, icon: "🦪" },
  { id: "spheres", name: "Truffle Spheres", price: 150, icon: "👑" },
  { id: "candles", name: "Pastel Candles", price: 40, icon: "🕯️" },
];

const PRESET_MESSAGES = [
  "Happy Birthday 💕",
  "Happy Anniversary 💍",
  "Congratulations 🎉",
  "Best Mom Ever ✨",
];

export function CakeBuilderWidget() {
  const [selectedSize, setSelectedSize] = useState<SizeOption>(SIZES[0]!);
  const [selectedSponge, setSelectedSponge] = useState(SPONGES[0]!);
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorOption>(FLAVORS[0]!);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["berries", "gold"]);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeMessage, setCakeMessage] = useState("Happy Birthday");

  function toggleAddon(id: string) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const addonTotal = selectedAddons.reduce((sum, id) => {
    const addon = DECOR_ADDONS.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalEstimate = selectedSize.basePrice + addonTotal;

  const activeAddonNames = selectedAddons
    .map((id) => DECOR_ADDONS.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const whatsappText = encodeURIComponent(
    `Hi Ani Bakes! 🎂 I customized a bespoke celebration cake on your studio:\n\n` +
      `• Size & Servings: ${selectedSize.name} (${selectedSize.serves})\n` +
      `• Base Sponge: ${selectedSponge.name}\n` +
      `• Flavor Profile: ${selectedFlavor.name} (${selectedFlavor.cream})\n` +
      `• Artisan Add-ons: ${activeAddonNames || "Standard Finish"}\n` +
      `• Dietary: ${isEggless ? "100% Eggless Vegetarian" : "Standard Farm Fresh Egg"}\n` +
      `• Hand-Piped Message: "${cakeMessage || "No Inscription"}"\n` +
      `• Estimated Total: ₹${totalEstimate}\n\n` +
      `Could you confirm slot availability for my upcoming celebration?`
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
              <Wand2 className="size-3.5" />
              <span>Bespoke Cake Atelier</span>
            </div>
            <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight">
              Interactive Cake Studio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground sm:text-right max-w-sm">
            Handcrafted with 100% pure butter and Belgian couverture chocolate the morning of your event.
          </p>
        </div>

        {/* Single-Screen Desktop Layout (6 Cols Left / 6 Cols Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lg:h-[580px]">
          
          {/* LEFT: Bento Controls (6 Columns) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3 h-full">
            
            {/* Bento Card 1: Canvas Size & Base Sponge */}
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-cocoa text-background text-[11px] font-bold">1</span>
                  <h3 className="font-sans font-bold text-sm text-foreground">Cake Size & Servings</h3>
                </div>
                <span className="text-[11px] font-extrabold text-cocoa bg-cocoa/10 px-2.5 py-0.5 rounded-full">
                  {selectedSize.serves}
                </span>
              </div>

              {/* 4 Size Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col justify-between p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-xs"
                          : "border-border/80 bg-background/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{size.icon}</span>
                        {isSelected && (
                          <span className="flex size-3.5 items-center justify-center rounded-full bg-cocoa text-background">
                            <Check className="size-2" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <p className="font-bold text-xs text-foreground truncate">{size.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{size.serves}</p>
                        <p className="text-xs font-extrabold text-cocoa mt-0.5">₹{size.basePrice}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sponge Crumb Selector */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Base Sponge Texture
                  </span>
                  <span className="text-[10px] text-muted-foreground">{selectedSponge.desc}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SPONGES.map((sponge) => {
                    const isSelected = selectedSponge.id === sponge.id;
                    return (
                      <button
                        key={sponge.id}
                        type="button"
                        onClick={() => setSelectedSponge(sponge)}
                        className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-cocoa bg-cocoa text-background shadow-xs font-bold text-xs"
                            : "border-border/70 bg-background/40 hover:bg-secondary text-xs text-foreground"
                        }`}
                      >
                        {sponge.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bento Card 2: Flavor & Buttercream Pairing */}
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-cocoa text-background text-[11px] font-bold">2</span>
                  <h3 className="font-sans font-bold text-sm text-foreground">Flavour Pairing</h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                  {selectedFlavor.cream}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-xs"
                          : "border-border/80 bg-background/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`size-3 rounded-full shrink-0 shadow-xs ${flavor.accent}`} />
                        <div className="truncate">
                          <p className="font-bold text-xs text-foreground truncate">{flavor.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{flavor.cream}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="size-3.5 text-cocoa shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Card 3: Custom Plaque Message */}
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-cocoa text-background text-[11px] font-bold">3</span>
                  <h3 className="font-sans font-bold text-sm text-foreground">Hand-Piped Inscription</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {cakeMessage.length}/30 chars
                </span>
              </div>

              <input
                id="cake-message"
                type="text"
                maxLength={30}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy 25th Birthday Maya 💕"
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cocoa/30"
              />

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => setCakeMessage(msg)}
                    className="px-2.5 py-0.5 rounded-full bg-secondary/60 hover:bg-secondary text-[10.5px] font-medium text-foreground transition-all cursor-pointer"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Live Realistic Showcase + Toppings & Order CTA (6 Columns) */}
          <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-5 shadow-lift flex flex-col justify-between overflow-hidden relative h-full">
            
            {/* Top Showcase: High-Res Real Cake Photograph with Inter Inscription Plaque */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Live Cake Atelier
                  </span>
                  <h4 className="font-sans font-bold text-sm text-foreground">{selectedFlavor.name}</h4>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  <Sparkles className="size-2.5" /> Real Studio Bake
                </span>
              </div>

              {/* High-Resolution Cake Photograph Container */}
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-border/80 shadow-md group">
                <img
                  src={selectedFlavor.image}
                  alt={selectedFlavor.name}
                  className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 select-none"
                />

                {/* Subtle Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15 pointer-events-none" />

                {/* Floating Top Badges */}
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {selectedSize.name}
                  </span>
                  <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {selectedFlavor.badge}
                  </span>
                </div>

                {/* Real-time Custom Message Plaque in Crisp Inter Font */}
                <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col items-center">
                  <div className="w-full rounded-xl bg-black/65 backdrop-blur-md border border-white/30 p-2.5 text-center shadow-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-0.5">
                      Hand-Piped Inscription
                    </p>
                    <p className="font-sans font-black text-base sm:text-lg text-white tracking-wide uppercase leading-tight drop-shadow-md break-words">
                      {cakeMessage.trim() ? cakeMessage : "Your Inscription Here"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Artisan Toppings & Dietary Integrated Right Below Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Artisan Make-Up Toppings ({selectedAddons.length})
                  </span>
                  <span className="text-[10px] font-bold text-cocoa">
                    +₹{addonTotal}
                  </span>
                </div>

                {/* 6 Compact Topping Chips */}
                <div className="grid grid-cols-3 gap-1.5">
                  {DECOR_ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "border-amber-500 bg-amber-500/15 text-foreground ring-1 ring-amber-500 font-bold"
                            : "border-border/70 bg-background/40 hover:bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs shrink-0">{addon.icon}</span>
                          <span className="text-[10px] truncate">{addon.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-cocoa shrink-0 ml-0.5">+₹{addon.price}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dietary Requirement Pill */}
                <button
                  type="button"
                  onClick={() => setIsEggless(!isEggless)}
                  className={`w-full py-1 px-3 rounded-lg border text-center text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1 ${
                    isEggless
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-background/50 text-foreground border-border/80 hover:bg-secondary"
                  }`}
                >
                  <Leaf className={`size-3 ${isEggless ? "text-white" : "text-emerald-500"}`} />
                  <span>{isEggless ? "✓ 100% Eggless Vegetarian" : "Standard Farm Fresh Egg"}</span>
                </button>
              </div>
            </div>

            {/* Total Price & 1-Click WhatsApp Order CTA (Anchored at Base) */}
            <div className="pt-2.5 border-t border-border/60 mt-2 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                    Total Estimated Price
                  </p>
                  <p className="font-sans text-2xl font-black text-cocoa tracking-tight">
                    ₹{totalEstimate}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium truncate ml-2">
                  Base ₹{selectedSize.basePrice} + Toppings ₹{addonTotal}
                </span>
              </div>

              <Button
                asChild
                size="default"
                className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs shadow-lift h-10 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <a
                  href={`https://wa.me/917448724920?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>Book This Bespoke Cake via WhatsApp</span>
                </a>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
