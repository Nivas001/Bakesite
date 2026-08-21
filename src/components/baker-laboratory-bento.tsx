import { useState } from "react";
import { Sparkles, Clock, ShieldCheck, Flame, Lock, Unlock, Copy, Check, Thermometer, Wind, Droplets } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent } from "@/lib/site-content";
import { TextAnimate } from "@/components/godui/text-animate";

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
  const { content: siteContent } = useSiteContent();
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
    <section className="py-10 sm:py-16 bg-secondary/15">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-berry block mb-1">
              {siteContent.home_lab.badge || "Pure Craft & Cold Fermentation"}
            </span>
            <TextAnimate
              as="h2"
              animation="blurInUp"
              by="word"
              className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight uppercase tracking-wide"
            >
              {siteContent.home_lab.title || "The artisan bakery laboratory"}
            </TextAnimate>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
            {siteContent.home_lab.description || "No shortcuts, zero chemical improvers. Just wild fermentation, stone-ground flour, and real French butter."}
          </p>
        </div>

        {/* 4-Card Asymmetric Bento Grid (2x2 on Tablet, Full Asymmetric on Desktop, Vault Only on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5">
          
          {/* Card 1: Interactive Fermentation Stage Simulator (Amber Hearth Glow) */}
          <div className="hidden sm:flex lg:col-span-7 rounded-3xl border border-amber-300/60 bg-gradient-to-br from-[#FFFDF9] to-[#FFF4E8] dark:from-card dark:to-amber-950/20 p-5 sm:p-6 shadow-soft flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  <Flame className="size-3.5" />
                  <span>36-Hour Wild Ferment Cycle</span>
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-900/80 dark:text-amber-300">
                  🔥 220°C Deck Hearth
                </span>
              </div>

              <h3 className="font-blogh text-lg sm:text-xl font-bold text-cocoa uppercase tracking-wide">
                The 4:00 AM Dawn Bake Ritual
              </h3>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentStage.desc}
              </p>
            </div>

            {/* Interactive Fermentation Telemetry Stage Switcher */}
            <div className="mt-4 space-y-2.5 rounded-2xl bg-white/70 dark:bg-black/30 p-3 sm:p-3.5 border border-amber-200/70 dark:border-amber-900/30 backdrop-blur-xs">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-berry" /> Stage: {currentStage.name}
                </span>
                <div className="flex items-center gap-2.5 text-[11px] font-mono font-bold text-cocoa">
                  <span className="flex items-center gap-1"><Thermometer className="size-3 text-amber-500" /> {currentStage.temp}</span>
                  <span className="flex items-center gap-1"><Droplets className="size-3 text-blue-500" /> {currentStage.hydration}</span>
                </div>
              </div>

              {/* 4 Interactive Stage Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {FERMENT_STAGES.map((s, idx) => (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      activeStage === idx
                        ? "bg-[#2C1810] text-white border-[#2C1810] shadow-xs font-bold scale-[1.02]"
                        : "bg-white/80 dark:bg-card/80 text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <p className="text-[9px] font-mono opacity-80">{s.duration}</p>
                    <p className="text-[10.5px] font-bold truncate mt-0.5">{s.name.split(" ")[0]}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Clean Pantry Manifesto (Botanical Sage Mint Glow) */}
          <div className="hidden sm:flex lg:col-span-5 rounded-3xl border border-emerald-300/60 bg-gradient-to-br from-[#F7FCF9] to-[#ECF8F1] dark:from-card dark:to-emerald-950/20 p-5 sm:p-6 shadow-soft flex-col justify-between">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>Clean Pantry Promise</span>
              </span>
              <h3 className="font-blogh text-lg sm:text-xl font-bold text-cocoa uppercase tracking-wide">
                Zero Margarine. Zero Premixes.
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedIngredient !== null
                  ? INGREDIENTS[selectedIngredient]?.note
                  : "Tap any core pantry element below to inspect our ethical single-origin sourcing and purity specs."}
              </p>
            </div>

            {/* 4 Interactive Ingredient Origin Chips */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-bold">
              {INGREDIENTS.map((ing, idx) => {
                const isSelected = selectedIngredient === idx;
                return (
                  <button
                    key={ing.name}
                    type="button"
                    onClick={() => setSelectedIngredient(isSelected ? null : idx)}
                    className={`rounded-2xl p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 ring-1.5 ring-emerald-500 shadow-xs"
                        : "border-emerald-200/60 bg-white/70 dark:bg-card/70 hover:bg-emerald-500/10 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{ing.icon}</span>
                      <span className="text-[8.5px] font-mono text-emerald-800 dark:text-emerald-300 uppercase">{ing.name.split(" ")[0]}</span>
                    </div>
                    <div className="mt-1">
                      <p className="font-bold text-[11px] leading-tight">{ing.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{ing.origin}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Doorstep Cold-Chain Shield (Cool Ice Blue Glow) */}
          <div className="hidden sm:flex lg:col-span-5 rounded-3xl border border-sky-300/60 bg-gradient-to-br from-[#F5FAFD] to-[#E9F5FB] dark:from-card dark:to-sky-950/20 p-5 sm:p-6 shadow-soft flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 px-3 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <Wind className="size-3.5" />
                <span>Doorstep Cold-Chain Shield</span>
              </span>
              <h3 className="font-blogh text-lg sm:text-xl font-bold text-cocoa uppercase tracking-wide">
                Tropical Heat & Humidity Shield
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pondicherry humidity is defeated by insulated thermal cake boxes. Delicate buttercreams and crisp laminated croissants arrive cellar-fresh.
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-white/80 dark:bg-card/80 p-3 border border-sky-200/70 dark:border-sky-900/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-muted-foreground font-medium">Cellar Box Temp:</span>
              </div>
              <span className="font-mono font-black text-sky-700 dark:text-sky-400">18°C Controlled</span>
            </div>
          </div>

          {/* Card 4: Head Baker's Vault (Rose Gold & Velvet Glow - Rendered prominently on ALL devices, exclusively on Mobile) */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-7 rounded-3xl border border-rose-300/70 bg-gradient-to-br from-[#FFF9F6] via-[#FFF3EE] to-[#FFEAE3] dark:from-card dark:to-berry/20 p-5 sm:p-6 shadow-soft flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/15 text-berry border border-berry/30 px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>Head Baker's Vault</span>
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                  EASTER EGG #01
                </span>
              </div>

              <h3 className="font-blogh text-lg sm:text-2xl font-bold text-cocoa uppercase tracking-wide">
                Secret Baker's Passcode
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Inspired by artisan tradition, we hide a secret privilege for bakery connoisseurs who explore our craft laboratory.
              </p>
            </div>

            {/* Interactive Vault Unlock Box */}
            <div className="mt-4 pt-3 border-t border-rose-200/80 dark:border-border/60">
              {!vaultUnlocked ? (
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/90 dark:bg-card hover:bg-white text-cocoa text-xs font-bold border border-rose-300/70 shadow-soft transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Lock className="size-4 text-berry animate-bounce" />
                  <span>Tap to Unlock Head Baker's Secret 10% Passcode</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-berry/15 border border-berry/30 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Unlock className="size-4 text-berry" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C1810] text-white text-xs font-bold hover:bg-[#3D2217] transition-all cursor-pointer shadow-xs"
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

export default BakerLaboratoryBento;
