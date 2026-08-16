import { useState } from "react";
import { Sparkles, Clock, ShieldCheck, Flame, Heart, Lock, Unlock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function BakerLaboratoryBento() {
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const SECRET_CODE = "MAINCHARACTER";

  function handleUnlock() {
    setVaultUnlocked(true);
    toast.success("✨ You found the Head Baker's Secret Vault! 10% discount unlocked.");
  }

  function handleCopy() {
    navigator.clipboard.writeText(SECRET_CODE);
    setCopied(true);
    toast.success(`Promo code "${SECRET_CODE}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="py-14 sm:py-20 bg-secondary/15">
      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-berry mb-2">
              <Sparkles className="size-3.5" />
              <span>Behind the Flour & Fire</span>
            </div>
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
          
          {/* Card 1: 4:00 AM Dawn Bake Ritual (7 Columns) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  <Flame className="size-3.5" />
                  <span>36-Hour Wild Ferment</span>
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  🔥 220°C Deck Oven
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-cocoa">
                The 4:00 AM Dawn Bake Ritual
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                While Pondicherry sleeps, our stone-hearth ovens heat to 220°C. Sourdough loaves shaped the day prior complete their 36-hour cold proof for blistered, crackling crusts and open, custard-soft crumb.
              </p>
            </div>

            {/* Visual Rise Bar */}
            <div className="mt-6 space-y-2 rounded-2xl bg-secondary/40 p-4 border border-border/50">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-berry" /> Fermentation Stage
                </span>
                <span className="text-berry font-mono">100% Proofed & Ready</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-amber-400 via-rose-400 to-berry rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card 2: Clean Pantry Manifesto (5 Columns) */}
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
                Every pastry is laminated with 100% pure high-fat dairy butter. Real Bourbon vanilla beans, Belgian couverture chocolate, and whole organic dairy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5 text-[11px] font-bold text-foreground">
              <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50 text-center">
                🧈 100% French Butter
              </div>
              <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50 text-center">
                🌾 Stone-Ground Flour
              </div>
              <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50 text-center">
                🍫 70% Couverture
              </div>
              <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50 text-center">
                🥚 Free-Range Farm Eggs
              </div>
            </div>
          </div>

          {/* Card 3: Doorstep Temperature Shield (5 Columns) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                📍 Doorstep Cold-Chain
              </span>
              <h3 className="font-display text-xl font-bold text-cocoa">
                Tropical Heat Packaging
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pondicherry humidity is no match for our insulated pastry vaults. Delicate buttercreams and crisp laminated layers arrive cellar-cool.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-secondary/40 p-3 border border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">GPS Doorstep Pinning:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">✓ Enabled</span>
            </div>
          </div>

          {/* Card 4: The Baker's Secret Vault Easter Egg (7 Columns) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-7 shadow-soft flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/15 text-berry border border-berry/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
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
                Inspired by artisan tradition, we hide a secret discount for discerning bakery connoisseurs who explore our craft laboratory.
              </p>
            </div>

            <div className="mt-5">
              {!vaultUnlocked ? (
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-cocoa/40 bg-secondary/60 hover:bg-cocoa hover:text-background p-4 text-xs font-bold text-cocoa transition-all duration-200 cursor-pointer group shadow-2xs"
                >
                  <Lock className="size-4 text-amber-500 group-hover:text-amber-300 transition-colors" />
                  <span>Tap to Unlock Head Baker's Secret Code</span>
                </button>
              ) : (
                <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-black shadow-xs font-black">
                      <Unlock className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 tracking-wider">
                        Secret Promo Code (10% Off)
                      </p>
                      <p className="font-mono text-base font-black text-cocoa tracking-wider">
                        {SECRET_CODE}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-xl bg-cocoa text-background px-4 py-2 text-xs font-bold shadow-soft hover:bg-cocoa/90 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-amber-300" />}
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
