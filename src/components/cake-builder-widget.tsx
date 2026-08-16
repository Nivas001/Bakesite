import { useState } from "react";
import { Sparkles, MessageCircle, Check, Wand2, Users, Heart, ShieldCheck, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SizeOption {
  id: string;
  name: string;
  serves: string;
  basePrice: number;
  icon: string;
  dimensions: string;
}

interface FlavorOption {
  id: string;
  name: string;
  cream: string;
  image: string;
  badge: string;
  accent: string;
  textColor: string;
  border: string;
}

const SIZES: SizeOption[] = [
  {
    id: "bento",
    name: '4" Bento Cake',
    serves: "Feeds 2–3 guests",
    basePrice: 550,
    icon: "🧁",
    dimensions: '4 inch · Single tier',
  },
  {
    id: "layer6",
    name: '6" Layer Cake',
    serves: "Feeds 6–8 guests",
    basePrice: 1250,
    icon: "🎂",
    dimensions: '6 inch · Double tier',
  },
  {
    id: "feast8",
    name: '8" Grand Feast',
    serves: "Feeds 12–16 guests",
    basePrice: 1850,
    icon: "👑",
    dimensions: '8 inch · Triple tier',
  },
  {
    id: "slab",
    name: "Brownie Feast Slab",
    serves: "Feeds 10–14 guests",
    basePrice: 1450,
    icon: "🍫",
    dimensions: "9x9 inch · Mosaic slab",
  },
];

const SPONGES = [
  { id: "chiffon", name: "Fluffy Chiffon", desc: "Airy & feather-light" },
  { id: "butter", name: "Heritage Butter", desc: "Dense & velvety crumb" },
  { id: "fudge", name: "Belgian Dark Fudge", desc: "Ultra-moist chocolate" },
];

const FLAVORS: FlavorOption[] = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped Berry Mascarpone",
    image: "/cakes/pink-bento-cake.jpg",
    badge: "Signature Romance",
    accent: "bg-rose-500",
    textColor: "text-rose-900 dark:text-rose-100",
    border: "border-rose-400",
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark Cocoa Ganache Drip",
    image: "/cakes/belgian-truffle-cake.jpg",
    badge: "Rich Decadence",
    accent: "bg-amber-600",
    textColor: "text-amber-100",
    border: "border-amber-500",
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French Buttercream & Berries",
    image: "/cakes/butterfly-lilac-cake.jpg",
    badge: "Artisan Floral",
    accent: "bg-purple-500",
    textColor: "text-purple-100",
    border: "border-purple-400",
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Caramel Lotus Feathering",
    image: "/cakes/biscoff-herringbone-cake.jpg",
    badge: "Celebration Crunch",
    accent: "bg-orange-500",
    textColor: "text-amber-100",
    border: "border-orange-400",
  },
];

const DECOR_ADDONS = [
  { id: "berries", name: "Fresh Berry Crown", price: 100, icon: "🍓" },
  { id: "gold", name: "24K Gold Leaf Shimmer", price: 120, icon: "✨" },
  { id: "blossoms", name: "Piped Buttercream Blossoms", price: 80, icon: "🌸" },
  { id: "pearls", name: "Edible Pearl Beading", price: 50, icon: "🦪" },
  { id: "spheres", name: "Golden Truffle Spheres", price: 150, icon: "👑" },
  { id: "candles", name: "Artisan Pastel Candles", price: 40, icon: "🕯️" },
];

const BORDER_STYLES = [
  { id: "lambeth", name: "Vintage Ruffle" },
  { id: "pearls", name: "Pearl Beading" },
  { id: "minimal", name: "Minimalist Clean" },
];

const PRESET_MESSAGES = [
  "Happy Birthday 💕",
  "Happy Anniversary 💍",
  "Congratulations 🎉",
  "Forever & Always ✨",
];

export function CakeBuilderWidget() {
  const [selectedSize, setSelectedSize] = useState<SizeOption>(SIZES[0]!);
  const [selectedSponge, setSelectedSponge] = useState(SPONGES[0]!);
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorOption>(FLAVORS[0]!);
  const [selectedBorder, setSelectedBorder] = useState(BORDER_STYLES[0]!);
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
    `Hi Ani Bakes! 🎂 I customized a bespoke cake on your website studio:\n\n` +
      `• Canvas: ${selectedSize.name} (${selectedSize.serves})\n` +
      `• Sponge: ${selectedSponge.name} (${selectedSponge.desc})\n` +
      `• Flavor: ${selectedFlavor.name} (${selectedFlavor.cream})\n` +
      `• Border Style: ${selectedBorder.name}\n` +
      `• Artisan Add-ons: ${activeAddonNames || "None"}\n` +
      `• Dietary: ${isEggless ? "100% Eggless Vegetarian" : "Standard Farm Egg"}\n` +
      `• Custom Plaque Message: "${cakeMessage || "No Message"}"\n` +
      `• Total Estimated: ₹${totalEstimate}\n\n` +
      `Could you confirm slot and design feasibility for an upcoming celebration?`
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
              <Wand2 className="size-3.5" />
              <span>Bespoke Cake Atelier</span>
            </div>
            <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight">
              Interactive Cake Studio
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md md:text-right">
            Handcrafted with 100% pure butter and Belgian couverture chocolate the morning of your event.
          </p>
        </div>

        {/* Bento Grid Studio Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: Bento Controls (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Bento Card 1: Canvas Size & Servings */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-background text-xs font-bold">1</span>
                  <h3 className="font-sans font-bold text-base text-foreground">Select Cake Size & Servings</h3>
                </div>
                <span className="text-xs font-extrabold text-cocoa bg-cocoa/10 px-2.5 py-1 rounded-full">
                  {selectedSize.serves}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-sm"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{size.icon}</span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-cocoa text-background">
                            <Check className="size-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-sm text-foreground">{size.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{size.serves}</p>
                        <p className="text-sm font-extrabold text-cocoa mt-1.5">₹{size.basePrice}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sponge Crumb Selector */}
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Base Sponge Texture
                </p>
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
                            ? "border-cocoa bg-cocoa text-background shadow-xs font-bold"
                            : "border-border/70 bg-background/40 hover:bg-secondary/50 text-foreground"
                        }`}
                      >
                        <p className="font-bold text-xs">{sponge.name}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>
                          {sponge.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bento Card 2: Flavour & Artisan Cream Pairing */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-background text-xs font-bold">2</span>
                  <h3 className="font-sans font-bold text-base text-foreground">Flavour & Buttercream Pairing</h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {selectedFlavor.cream}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa shadow-sm"
                          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`size-3.5 rounded-full shrink-0 shadow-xs ${flavor.accent}`} />
                        <div>
                          <p className="font-bold text-sm text-foreground">{flavor.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{flavor.cream}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 text-cocoa shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Card 3: Artisan Make-Up & Decor Toppings */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-background text-xs font-bold">3</span>
                  <h3 className="font-sans font-bold text-base text-foreground">Artisan Toppings & Finish</h3>
                </div>
                <span className="text-xs font-bold text-cocoa bg-amber-500/15 px-2.5 py-1 rounded-full">
                  {selectedAddons.length} selected (+₹{addonTotal})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DECOR_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "border-amber-500 bg-amber-500/15 text-foreground ring-1.5 ring-amber-500 shadow-xs"
                          : "border-border/70 bg-background/40 hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{addon.icon}</span>
                        <span className="text-xs font-bold text-foreground truncate">{addon.name}</span>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-cocoa shrink-0 ml-1">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>

              {/* Piping Border Finish & 100% Eggless Switch */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Piped Border Finish
                  </label>
                  <div className="flex gap-1.5">
                    {BORDER_STYLES.map((border) => (
                      <button
                        key={border.id}
                        type="button"
                        onClick={() => setSelectedBorder(border)}
                        className={`flex-1 py-1.5 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          selectedBorder.id === border.id
                            ? "border-cocoa bg-cocoa text-background shadow-xs"
                            : "border-border/70 bg-background/40 hover:bg-secondary text-foreground"
                        }`}
                      >
                        {border.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Dietary Requirement
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEggless(!isEggless)}
                    className={`w-full py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isEggless
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-background/50 text-foreground border-border/80 hover:bg-secondary"
                    }`}
                  >
                    <Leaf className={`size-3.5 ${isEggless ? "text-white" : "text-emerald-500"}`} />
                    <span>{isEggless ? "100% Eggless Vegetarian" : "Standard Farm Fresh Egg"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bento Card 4: Custom Plaque Message */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-background text-xs font-bold">4</span>
                  <h3 className="font-sans font-bold text-base text-foreground">Custom Cake Message</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {cakeMessage.length}/30 chars
                </span>
              </div>

              <div className="space-y-2">
                <input
                  id="cake-message"
                  type="text"
                  maxLength={30}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="e.g. Happy 25th Birthday Maya 💕"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cocoa/30"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_MESSAGES.map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      onClick={() => setCakeMessage(msg)}
                      className="px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-all cursor-pointer"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: Live Realistic Showcase Column (5 Columns) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 shadow-lift flex flex-col justify-between overflow-hidden relative lg:sticky lg:top-24 h-fit">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Live Cake Atelier
                  </span>
                  <h4 className="font-sans font-bold text-base text-foreground">{selectedFlavor.name}</h4>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                  <Sparkles className="size-3" /> Real Studio Bake
                </span>
              </div>

              {/* High-Resolution Real Cake Photograph Showcase */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-border/80 shadow-md group">
                <img
                  src={selectedFlavor.image}
                  alt={selectedFlavor.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

                {/* Floating Top Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {selectedSize.name}
                  </span>
                  <span className="rounded-full bg-amber-400 text-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {selectedFlavor.badge}
                  </span>
                </div>

                {/* Real-time Custom Message Plaque in Crisp Inter Font */}
                <div className="absolute inset-x-4 bottom-4 z-10 flex flex-col items-center">
                  <div className="w-full rounded-2xl bg-black/65 backdrop-blur-md border border-white/30 p-3.5 text-center shadow-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-0.5">
                      Hand-Piped Inscription
                    </p>
                    <p className="font-sans font-black text-lg sm:text-xl text-white tracking-wide uppercase leading-tight drop-shadow-md break-words">
                      {cakeMessage.trim() ? cakeMessage : "Your Inscription Here"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Itemized Recipe Specification */}
              <div className="rounded-2xl bg-secondary/50 p-4 border border-border/60 text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Canvas Size:</span>
                  <span className="font-bold text-foreground">{selectedSize.name} ({selectedSize.serves})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sponge & Filling:</span>
                  <span className="font-bold text-foreground">{selectedSponge.name} · {selectedFlavor.cream}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toppings ({selectedAddons.length}):</span>
                  <span className="font-semibold text-cocoa line-clamp-1">{activeAddonNames || "Standard Finish"}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Dietary:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {isEggless ? "100% Eggless Vegetarian" : "Standard Farm Fresh Egg"}
                  </span>
                </div>
              </div>

            </div>

            {/* Total Price & 1-Click WhatsApp Order CTA */}
            <div className="pt-4 border-t border-border/60 mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Total Estimated Price
                  </p>
                  <p className="font-sans text-3xl font-black text-cocoa tracking-tight mt-0.5">
                    ₹{totalEstimate}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  Base ₹{selectedSize.basePrice} + Add-ons ₹{addonTotal}
                </span>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-sm shadow-lift h-12 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <a
                  href={`https://wa.me/917448724920?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-4.5 text-emerald-400" />
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
