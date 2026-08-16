import { useState } from "react";
import { Sparkles, MessageCircle, Check, Wand2, Plus, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIZES = [
  {
    id: "bento",
    name: '4" Bento',
    serves: "2–3 P",
    basePrice: 550,
    icon: "🧁",
  },
  {
    id: "layer6",
    name: '6" Layer',
    serves: "6–8 P",
    basePrice: 1250,
    icon: "🎂",
  },
  {
    id: "feast8",
    name: '8" Feast',
    serves: "12–16 P",
    basePrice: 1850,
    icon: "👑",
  },
  {
    id: "slab",
    name: "Brownie Slab",
    serves: "10–14 P",
    basePrice: 1450,
    icon: "🍫",
  },
];

const SPONGES = [
  { id: "chiffon", name: "Fluffy Chiffon", tag: "Airy & Light" },
  { id: "butter", name: "Butter Crumb", tag: "Rich & Moist" },
  { id: "fudge", name: "Belgian Fudge", tag: "Decadent" },
];

const FLAVORS = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped Mascarpone",
    cakeBg: "bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 dark:from-pink-900 dark:to-rose-950",
    textColor: "text-rose-900 dark:text-rose-100",
    border: "border-pink-300 dark:border-pink-800",
    dotColor: "bg-rose-400",
    frostingColor: "#fbcfe8",
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark Cocoa Ganache",
    cakeBg: "bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white",
    textColor: "text-amber-200",
    border: "border-amber-700 dark:border-amber-700",
    dotColor: "bg-amber-500",
    frostingColor: "#451a03",
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French Buttercream",
    cakeBg: "bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-300 dark:from-purple-900 dark:to-indigo-950",
    textColor: "text-purple-950 dark:text-purple-100",
    border: "border-purple-300 dark:border-purple-800",
    dotColor: "bg-purple-400",
    frostingColor: "#e9d5ff",
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Lotus Cookie Butter",
    cakeBg: "bg-gradient-to-br from-amber-200 via-orange-100 to-amber-300 dark:from-amber-900 dark:to-orange-950",
    textColor: "text-amber-950 dark:text-amber-100",
    border: "border-orange-300 dark:border-orange-800",
    dotColor: "bg-orange-400",
    frostingColor: "#fed7aa",
  },
];

const DECOR_ADDONS = [
  { id: "berries", name: "Fresh Berries", price: 100, icon: "🍓" },
  { id: "blossoms", name: "Piped Blossoms", price: 80, icon: "🌸" },
  { id: "gold", name: "24K Gold Leaf", price: 120, icon: "✨" },
  { id: "pearls", name: "Sugar Pearls", price: 50, icon: "🦪" },
  { id: "spheres", name: "Truffle Spheres", price: 150, icon: "👑" },
  { id: "candles", name: "Pastel Candles", price: 40, icon: "🕯️" },
];

const BORDER_STYLES = [
  { id: "lambeth", name: "Vintage Ruffle" },
  { id: "pearls", name: "Pearl Beading" },
  { id: "minimal", name: "Clean Edge" },
];

export function CakeBuilderWidget() {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]!);
  const [selectedSponge, setSelectedSponge] = useState(SPONGES[0]!);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]!);
  const [selectedBorder, setSelectedBorder] = useState(BORDER_STYLES[0]!);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["berries", "pearls"]);
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
    `Hi Ani Bakes! 🎂 I customized a bespoke cake on your website studio:\n\n` +
      `• Canvas: ${selectedSize.name} (${selectedSize.serves})\n` +
      `• Sponge: ${selectedSponge.name}\n` +
      `• Flavour: ${selectedFlavor.name} (${selectedFlavor.cream})\n` +
      `• Border: ${selectedBorder.name}\n` +
      `• Add-ons: ${activeAddonNames || "None"}\n` +
      `• Dietary: ${isEggless ? "100% Eggless Vegetarian" : "Standard Farm Egg"}\n` +
      `• Custom Message on Cake: "${cakeMessage || "No Message"}"\n` +
      `• Total: ₹${totalEstimate}\n\n` +
      `Could you confirm slot and design feasibility for an upcoming celebration?`
  );

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
              <Wand2 className="size-3.5" />
              <span>Interactive Cake Studio</span>
            </div>
            <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight">
              Design your celebration bake
            </h2>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right max-w-xs">
            Configure size, sponge crumb, artisan creams, and edible decor in real-time.
          </p>
        </div>

        {/* Compact Single-Desktop Bento Grid (Locked Height on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch lg:h-[560px]">
          
          {/* Controls Bento Column (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3 h-full">
            
            {/* Bento Card 1: Canvas Size & Base Sponge */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2.5">
              
              {/* Size Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    1. Canvas Size
                  </span>
                  <span className="text-[10px] font-bold text-cocoa">
                    {selectedSize.name} · {selectedSize.serves}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SIZES.map((size) => {
                    const isSelected = selectedSize.id === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-cocoa bg-cocoa/10 ring-1.5 ring-cocoa shadow-2xs font-bold text-foreground"
                            : "border-border/80 bg-background/50 hover:bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <span className="text-xs">{size.icon}</span>
                        <span className="font-bold text-[11px] mt-0.5">{size.name}</span>
                        <span className="text-[9px] font-mono font-extrabold text-cocoa">₹{size.basePrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sponge Chips */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Base Sponge Crumb
                  </span>
                  <span className="text-[9px] text-muted-foreground">{selectedSponge.tag}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SPONGES.map((sponge) => {
                    const isSelected = selectedSponge.id === sponge.id;
                    return (
                      <button
                        key={sponge.id}
                        type="button"
                        onClick={() => setSelectedSponge(sponge)}
                        className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "border-cocoa bg-cocoa text-background"
                            : "border-border/70 bg-background/40 hover:bg-secondary/40 text-foreground"
                        }`}
                      >
                        {sponge.name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bento Card 2: Flavour Pairing */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  2. Flavour & Buttercream Pairing
                </span>
                <span className="text-[10px] font-semibold text-cocoa">
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
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-1.5 ring-cocoa shadow-2xs"
                          : "border-border/80 bg-background/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`size-2.5 rounded-full shrink-0 ${flavor.dotColor}`} />
                        <div className="truncate">
                          <p className="font-bold text-[11px] text-foreground truncate">{flavor.name}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{flavor.cream}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="size-3 text-cocoa shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Card 3: Decor Add-ons & Border Finish */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  3. Decor Toppings ({selectedAddons.length})
                </span>
                <span className="text-[10px] font-bold text-cocoa">
                  +₹{addonTotal}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {DECOR_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500"
                          : "border-border/70 bg-background/40 hover:bg-secondary/30 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[11px] shrink-0">{addon.icon}</span>
                        <span className="text-[10px] font-bold text-foreground truncate">{addon.name}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-cocoa shrink-0 ml-1">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>

              {/* Finish & Dietary Row */}
              <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
                <div className="flex gap-1">
                  {BORDER_STYLES.map((border) => (
                    <button
                      key={border.id}
                      type="button"
                      onClick={() => setSelectedBorder(border)}
                      className={`flex-1 py-1 px-1 rounded-lg border text-center text-[9px] font-bold transition-all cursor-pointer ${
                        selectedBorder.id === border.id
                          ? "border-cocoa bg-cocoa text-background"
                          : "border-border/70 bg-background/40 hover:bg-secondary text-foreground"
                      }`}
                    >
                      {border.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEggless(!isEggless)}
                  className={`py-1 px-2 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${
                    isEggless
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-background/60 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {isEggless ? "✓ 100% Eggless" : "Standard Farm Egg"}
                </button>
              </div>
            </div>

            {/* Bento Card 4: Custom Message Input */}
            <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-2xs flex items-center gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground shrink-0">
                Message:
              </span>
              <input
                id="cake-message"
                type="text"
                maxLength={30}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy Birthday Maya 💕"
                className="h-8 flex-1 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-1.5 focus:ring-cocoa/30"
              />
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                {cakeMessage.length}/30
              </span>
            </div>

          </div>

          {/* Right Column (5 Columns): Live Preview Canvas with Inter Font */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-lift overflow-hidden relative h-full">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Studio Preview
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold">
                  <Sparkles className="size-2.5" /> Real-time 3D Render
                </span>
              </div>

              {/* Stylized Visual Cake Canvas with Inter Font Center Plaque */}
              <div className="my-4 flex flex-col items-center justify-center">
                <div
                  className={`relative size-44 sm:size-52 rounded-full ${selectedFlavor.cakeBg} ${selectedFlavor.border} border-4 shadow-xl flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:scale-105 select-none`}
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
                    <div className="absolute top-3 left-4 text-xs animate-pulse">🍓</div>
                  )}
                  {selectedAddons.includes("gold") && (
                    <div className="absolute top-4 right-5 text-xs animate-bounce">✨</div>
                  )}
                  {selectedAddons.includes("blossoms") && (
                    <div className="absolute bottom-4 left-6 text-xs">🌸</div>
                  )}
                  {selectedAddons.includes("pearls") && (
                    <div className="absolute bottom-4 right-6 text-xs">🦪</div>
                  )}
                  {selectedAddons.includes("spheres") && (
                    <div className="absolute top-2 right-1/2 text-xs">👑</div>
                  )}

                  {/* Inner Frosting Center Plaque with Clean Modern Inter Font */}
                  <div className="w-full rounded-xl bg-white/85 dark:bg-black/75 backdrop-blur-xs p-2.5 border border-white/50 shadow-sm flex flex-col items-center justify-center">
                    <p className={`font-sans font-extrabold text-sm sm:text-base leading-tight tracking-tight uppercase break-words max-w-full ${selectedFlavor.textColor}`}>
                      {cakeMessage.trim() ? cakeMessage : "Your message"}
                    </p>
                  </div>

                  {/* Cake Base Label */}
                  <span className="absolute bottom-1.5 rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                    {selectedSize.name}
                  </span>
                </div>
              </div>

              {/* Recipe Summary */}
              <div className="rounded-xl bg-secondary/40 p-2.5 border border-border/50 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Configuration:</span>
                  <span className="font-bold text-foreground truncate ml-2">
                    {selectedSize.name} · {selectedSponge.name} · {selectedFlavor.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Toppings ({selectedAddons.length}):</span>
                  <span className="font-semibold text-cocoa truncate ml-2">
                    {activeAddonNames || "Standard"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/40">
                  <span>Dietary:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isEggless ? "100% Eggless Vegetarian" : "Standard Farm Egg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Estimate & Order Action (Anchored at Base) */}
            <div className="pt-3 border-t border-border/60 mt-3 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                    Estimated Total
                  </p>
                  <p className="font-sans text-2xl font-black text-cocoa tracking-tight">
                    ₹{totalEstimate}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Base ₹{selectedSize.basePrice} + Add-ons ₹{addonTotal}
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
