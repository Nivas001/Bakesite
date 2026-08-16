import { useState } from "react";
import { Sparkles, MessageCircle, Check, Wand2, Plus, Flame, Heart } from "lucide-react";
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

const SPONGES = [
  { id: "chiffon", name: "Fluffy Chiffon", desc: "Feather-light & airy" },
  { id: "butter", name: "Heritage Butter Crumb", desc: "Rich, dense & velvety" },
  { id: "fudge", name: "Belgian Dark Fudge", desc: "Ultra-moist decadence" },
];

const FLAVORS = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped Mascarpone",
    cakeBg: "bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 dark:from-pink-900 dark:to-rose-950",
    textColor: "text-rose-700 dark:text-rose-200",
    border: "border-pink-300 dark:border-pink-800",
    dotColor: "bg-rose-400",
    frostingColor: "#fbcfe8",
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark Cocoa Ganache",
    cakeBg: "bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white",
    textColor: "text-amber-300",
    border: "border-amber-700 dark:border-amber-700",
    dotColor: "bg-amber-500",
    frostingColor: "#451a03",
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French Buttercream",
    cakeBg: "bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-300 dark:from-purple-900 dark:to-indigo-950",
    textColor: "text-purple-800 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-800",
    dotColor: "bg-purple-400",
    frostingColor: "#e9d5ff",
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Lotus Cookie Butter",
    cakeBg: "bg-gradient-to-br from-amber-200 via-orange-100 to-amber-300 dark:from-amber-900 dark:to-orange-950",
    textColor: "text-amber-900 dark:text-amber-100",
    border: "border-orange-300 dark:border-orange-800",
    dotColor: "bg-orange-400",
    frostingColor: "#fed7aa",
  },
];

const DECOR_ADDONS = [
  { id: "berries", name: "Fresh Berry Crown", price: 100, icon: "🍓" },
  { id: "blossoms", name: "Buttercream Blossoms", price: 80, icon: "🌸" },
  { id: "gold", name: "24K Gold Leaf Shimmer", price: 120, icon: "✨" },
  { id: "pearls", name: "Edible Pearl Beading", price: 50, icon: "🦪" },
  { id: "spheres", name: "Golden Truffle Spheres", price: 150, icon: "👑" },
  { id: "candles", name: "Artisan Pastel Candles", price: 40, icon: "🕯️" },
];

const BORDER_STYLES = [
  { id: "lambeth", name: "Vintage Ruffle" },
  { id: "pearls", name: "Pearl Beading" },
  { id: "minimal", name: "Minimalist Clean" },
];

export function CakeBuilderWidget() {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]!);
  const [selectedSponge, setSelectedSponge] = useState(SPONGES[0]!);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]!);
  const [selectedBorder, setSelectedBorder] = useState(BORDER_STYLES[0]!);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["berries", "pearls"]);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeMessage, setCakeMessage] = useState("Tummy the Main Character");

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
    `Hi Ani Bakes! 🎂 I customized a bespoke cake on your website simulator:\n\n` +
      `• Canvas: ${selectedSize.name} (${selectedSize.desc})\n` +
      `• Base Sponge: ${selectedSponge.name}\n` +
      `• Flavour & Cream: ${selectedFlavor.name} (${selectedFlavor.cream})\n` +
      `• Border Style: ${selectedBorder.name}\n` +
      `• Decor & Make-up Add-ons: ${activeAddonNames || "None"}\n` +
      `• Dietary: ${isEggless ? "100% Eggless Vegetarian" : "Standard Free-Range Egg"}\n` +
      `• Custom Message on Cake: "${cakeMessage || "No Message"}"\n` +
      `• Calculated Total: ₹${totalEstimate}\n\n` +
      `Could you confirm slot and design feasibility for an upcoming celebration?`
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
            <Wand2 className="size-3.5" />
            <span>Interactive Cake Studio Simulator</span>
          </div>
          <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight">
            Design your dream celebration bake
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Configure sponges, artisan creams, custom border piping, and edible decor in real-time.
          </p>
        </div>

        {/* 2-Column Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Controls Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-soft">
            
            {/* 1. Canvas & Size */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                <span>1. Select Cake Canvas & Size</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-2xs"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
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
                        <p className="font-bold text-xs text-foreground">{size.name}</p>
                        <p className="text-[10px] text-muted-foreground">{size.desc}</p>
                        <p className="text-xs font-extrabold text-cocoa mt-0.5">₹{size.basePrice}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sponge Texture */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <span>2. Base Sponge Crumb</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SPONGES.map((sponge) => {
                  const isSelected = selectedSponge.id === sponge.id;
                  return (
                    <button
                      key={sponge.id}
                      type="button"
                      onClick={() => setSelectedSponge(sponge)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-1.5 ring-cocoa"
                          : "border-border/80 bg-background/40 hover:bg-secondary/30"
                      }`}
                    >
                      <p className="font-bold text-[11px] text-foreground">{sponge.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{sponge.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Flavour & Buttercream */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <span>3. Flavour & Buttercream Pairing</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-1.5 ring-cocoa shadow-2xs"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${flavor.dotColor}`} />
                          <span className="font-bold text-xs text-foreground">{flavor.name}</span>
                        </div>
                        {isSelected && <Check className="size-3 text-cocoa" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {flavor.cream}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Make-Up / Decor Add-ons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  4. Artisan Make-Up & Decor Toppings
                </label>
                <span className="text-[10px] font-semibold text-cocoa">
                  {selectedAddons.length} selected (+₹{addonTotal})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DECOR_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500"
                          : "border-border/80 bg-background/40 hover:bg-secondary/30 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{addon.icon}</span>
                        <span className="text-[11px] font-bold text-foreground">{addon.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cocoa">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Border Style & Dietary Switch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Piped Border Finish
                </label>
                <div className="flex gap-1.5">
                  {BORDER_STYLES.map((border) => (
                    <button
                      key={border.id}
                      type="button"
                      onClick={() => setSelectedBorder(border)}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${
                        selectedBorder.id === border.id
                          ? "border-cocoa bg-cocoa text-background"
                          : "border-border bg-background/40 hover:bg-secondary text-foreground"
                      }`}
                    >
                      {border.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Dietary Option
                </label>
                <button
                  type="button"
                  onClick={() => setIsEggless(!isEggless)}
                  className={`w-full py-1.5 px-3 rounded-lg border text-center text-[11px] font-bold transition-all cursor-pointer ${
                    isEggless
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-background/60 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {isEggless ? "✓ 100% Eggless Vegetarian" : "Standard Farm Egg"}
                </button>
              </div>
            </div>

            {/* 6. Custom Message */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="cake-message" className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Custom Pipe Message on Cake
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
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs sm:text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cocoa/30"
              />
            </div>

          </div>

          {/* Live Preview Canvas Column (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-lift overflow-hidden relative">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Studio Preview
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  <Sparkles className="size-2.5" /> Real-time 3D Render
                </span>
              </div>

              {/* Stylized Visual Cake Canvas with Decor Make-Up */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div
                  className={`relative size-56 sm:size-64 rounded-full ${selectedFlavor.cakeBg} ${selectedFlavor.border} border-4 shadow-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:scale-105 select-none`}
                >
                  {/* Decorative Border Ring */}
                  {selectedBorder.id === "lambeth" && (
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/50 pointer-events-none" />
                  )}
                  {selectedBorder.id === "pearls" && (
                    <div className="absolute inset-1.5 rounded-full border-4 border-dotted border-white/70 pointer-events-none" />
                  )}

                  {/* Dynamic Decor Icons */}
                  {selectedAddons.includes("berries") && (
                    <div className="absolute top-4 left-6 text-sm animate-pulse">🍓</div>
                  )}
                  {selectedAddons.includes("gold") && (
                    <div className="absolute top-5 right-7 text-sm animate-bounce">✨</div>
                  )}
                  {selectedAddons.includes("blossoms") && (
                    <div className="absolute bottom-5 left-8 text-sm">🌸</div>
                  )}
                  {selectedAddons.includes("pearls") && (
                    <div className="absolute bottom-5 right-8 text-sm">🦪</div>
                  )}
                  {selectedAddons.includes("spheres") && (
                    <div className="absolute top-2 right-1/2 text-sm">👑</div>
                  )}

                  {/* Inner Frosting Center Plaque with Custom Message */}
                  <div className="w-full rounded-2xl bg-white/80 dark:bg-black/70 backdrop-blur-xs p-3.5 border border-white/50 shadow-sm flex flex-col items-center justify-center">
                    <p className={`font-script text-xl sm:text-2xl font-bold leading-snug break-words max-w-full ${selectedFlavor.textColor}`}>
                      {cakeMessage.trim() ? cakeMessage : "Your message here"}
                    </p>
                  </div>

                  {/* Cake Base Label */}
                  <span className="absolute bottom-2 rounded-full bg-black/50 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
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
                  <span>Sponge & Flavour:</span>
                  <span className="font-bold text-foreground">{selectedSponge.name} · {selectedFlavor.name}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Toppings ({selectedAddons.length}):</span>
                  <span className="font-semibold text-cocoa line-clamp-1">{activeAddonNames || "Standard"}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/40">
                  <span>Dietary:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isEggless ? "100% Eggless Vegetarian" : "Standard Farm Egg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Estimate & Order Action */}
            <div className="pt-4 border-t border-border/60 mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Estimated Total
                  </p>
                  <p className="font-sans text-2xl font-black text-cocoa tracking-tight">
                    ₹{totalEstimate}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Base ₹{selectedSize.basePrice} + Add-ons ₹{addonTotal}
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
