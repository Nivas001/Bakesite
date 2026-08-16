import { useState } from "react";
import { Sparkles, Clock, ShieldCheck, Flame, Heart, Lock, Unlock, Copy, Check, Thermometer, Wind, Wheat, Droplets } from "lucide-react";
import { toast } from "sonner";

interface FermentStage {
  stage: string;
  name: string;
  duration: string;
  temp: string;
  hydration: string;
  desc: string;
}

const FERMENT_STAGES: FermentStage[] = [
  {
    stage: "01",
    name: "Autolyse & Levain",
    duration: "2 Hours",
    temp: "24°C",
    hydration: "78%",
    desc: "Flour absorbs water slowly while native wild yeasts awaken in our 4-year starter culture.",
  },
  {
    stage: "02",
    name: "Bulk Stretch & Fold",
    duration: "4.5 Hours",
    temp: "26°C",
    hydration: "80%",
    desc: "Gentle hourly coil folds build delicate gluten sheets without tearing the airy alveoli structure.",
  },
  {
    stage: "03",
    name: "36-Hour Cold Proof",
    duration: "36 Hours",
    temp: "4°C",
    hydration: "82%",
    desc: "Slow fermentation in our cold retarder breaks down starches for complex sourdough tang and blistered crusts.",
  },
  {
    stage: "04",
    name: "Stone Deck Hearth Bake",
    duration: "38 Mins",
    temp: "220°C",
    hydration: "Steam Injected",
    desc: "Injected deck steam creates the explosive oven spring, caramelized blistered ear, and custard crumb.",
  },
];

const INGREDIENTS = [
  {
    name: "100% French Butter",
    origin: "Normandy Dairy · 84% Butterfat",
    icon: "🧈",
    note: "High-fat dairy butter for unmatched 27-layer flaky lamination.",
  },
  {
    name: "Stone-Ground Wheat",
    origin: "Artisan Organic Grain Mill",
    icon: "🌾",
    note: "Cold stone-milled to retain the natural wheat germ, oils, and nutrients.",
  },
  {
    name: "70.5% Belgian Callebaut",
    origin: "Sustainable Cocoa Horizons",
    icon: "🍫",
    note: "Deep roasted cocoa nibs with silky viscosity for our fudge brownies.",
  },
  {
    name: "Free-Range Farm Eggs",
    origin: "Local Morning Farm Harvest",
    icon: "🥚",
    note: "Golden yolks delivering rich golden color and velvety sponge structure.",
  },
];

export function BakerLaboratoryBento() {
  const [activeStage, setActiveStage] = useState(2); // 36-hour cold proof active by default
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const SECRET_CODE = "MAINCHARACTER";

  function handleUnlock() {
    setVaultUnlocked(true);
    toast.success("✨ Secret Vault Unlocked! 10% discount promo code revealed.");
  }

  function handleCopy() {
    navigator.clipboard.writeText(SECRET_CODE);
    setCopied(true);
    toast.success(`Promo code "${SECRET_CODE}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  }

  const currentStage = FERMENT_STAGES[activeStage]!;

  return (
    <section className="py-14 sm:py-20 bg-secondary/15">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header (Clean: Behind the Flour & Fire subheader removed) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-nimbus text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
              The artisan bakery laboratory
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
            No shortcuts, zero chemical improvers. Just wild fermentation, stone-ground flour, and real French butter.
          </p>
        </div>

        {/* 4-Card Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          
          {/* Card 1: Interactive Fermentation Stage Simulator (7 Columns) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  <Flame className="size-3.5" />
                  <span>36-Hour Wild Ferment Cycle</span>
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  🔥 220°C Deck Hearth
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-cocoa">
                The 4:00 AM Dawn Bake Ritual
              </h3>
              
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentStage.desc}
              </p>
            </div>

            {/* Interactive Fermentation Telemetry Stage Switcher */}
            <div className="mt-6 space-y-3 rounded-2xl bg-secondary/40 p-4 border border-border/60">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-berry" /> Stage: {currentStage.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-cocoa">
                  <span className="flex items-center gap-1"><Thermometer className="size-3 text-amber-500" /> {currentStage.temp}</span>
                  <span className="flex items-center gap-1"><Droplets className="size-3 text-blue-500" /> {currentStage.hydration}</span>
                </div>
              </div>

              {/* 4 Interactive Stage Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {FERMENT_STAGES.map((s, idx) => (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      activeStage === idx
                        ? "bg-cocoa text-background border-cocoa shadow-xs font-bold scale-[1.02]"
                        : "bg-background/60 text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <p className="text-[10px] font-mono opacity-80">{s.duration}</p>
                    <p className="text-[11px] font-bold truncate mt-0.5">{s.name.split(" ")[0]}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Clean Pantry Manifesto (5 Columns) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft flex flex-col justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>Clean Pantry Promise</span>
              </span>
              <h3 className="font-display text-xl font-bold text-cocoa">
                Zero Margarine. Zero Premixes.
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedIngredient !== null
                  ? INGREDIENTS[selectedIngredient]?.note
                  : "Tap any core pantry element below to inspect our ethical single-origin sourcing and purity specs."}
              </p>
            </div>

            {/* 4 Interactive Ingredient Origin Chips */}
            <div className="grid grid-cols-2 gap-2 mt-5 text-[11px] font-bold">
              {INGREDIENTS.map((ing, idx) => {
                const isSelected = selectedIngredient === idx;
                return (
                  <button
                    key={ing.name}
                    type="button"
                    onClick={() => setSelectedIngredient(isSelected ? null : idx)}
                    className={`rounded-2xl p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-1.5 ring-emerald-500"
                        : "border-border/70 bg-secondary/40 hover:bg-secondary/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{ing.icon}</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">{ing.name.split(" ")[0]}</span>
                    </div>
                    <div className="mt-1">
                      <p className="font-bold text-xs">{ing.name}</p>
                      <p className="text-[9.5px] text-muted-foreground mt-0.5 truncate">{ing.origin}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Doorstep Cold-Chain & Humidity Protection (5 Columns) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Wind className="size-3.5" />
                <span>Doorstep Cold-Chain Shield</span>
              </span>
              <h3 className="font-display text-xl font-bold text-cocoa">
                Tropical Heat & Humidity Shield
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pondicherry humidity is defeated by insulated thermal cake boxes. Delicate buttercreams and crisp laminated croissants arrive cellar-fresh.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-secondary/40 p-3.5 border border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-muted-foreground font-medium">Cellar Box Temp:</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">18°C Controlled</span>
            </div>
          </div>

          {/* Card 4: The Baker's Secret Vault Easter Egg (7 Columns) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/10 p-6 sm:p-7 shadow-soft flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>Head Baker's Vault</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  EASTER EGG #01
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-cocoa">
                Secret Baker's Passcode
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Inspired by artisan tradition, we hide a secret privilege for bakery connoisseurs who explore our craft laboratory.
              </p>
            </div>

            {/* Interactive Vault Unlock Box */}
            <div className="mt-4 pt-3 border-t border-border/60">
              {!vaultUnlocked ? (
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold border border-border/80 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Lock className="size-4 text-amber-600" />
                  <span>Tap to Unlock Head Baker's Secret 10% Passcode</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Unlock className="size-4 text-amber-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Secret Promo Code
                      </span>
                      <span className="font-mono font-extrabold text-sm text-cocoa tracking-wider">
                        {SECRET_CODE}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cocoa text-background text-xs font-bold hover:bg-cocoa/90 transition-all cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
