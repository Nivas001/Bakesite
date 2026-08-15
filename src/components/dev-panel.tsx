import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FEATURE_FLAGS,
  FlagCategory,
  FlagKey,
  useFeatureFlags,
  useSocialLinks,
} from "@/lib/feature-flags";
import { Settings2, RotateCcw, Instagram, MessageCircle, ChevronDown, ChevronUp, Save } from "lucide-react";

const CATEGORIES: FlagCategory[] = [
  "Animations",
  "Home Page",
  "Shop Page",
  "Product Page",
  "Offers Page",
  "Footer",
];

const CATEGORY_ICONS: Record<FlagCategory, string> = {
  Animations: "🎬",
  "Home Page": "🏠",
  "Shop Page": "🛒",
  "Product Page": "📄",
  "Offers Page": "🎟",
  Footer: "🦶",
};

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const { flags, toggle, resetAll } = useFeatureFlags();
  const { links, save } = useSocialLinks();

  const [igInput, setIgInput] = useState(links.instagram);
  const [waInput, setWaInput] = useState(links.whatsapp);
  const [socialSaved, setSocialSaved] = useState(false);

  function handleSaveSocial() {
    save({ instagram: igInput.trim(), whatsapp: waInput.trim() });
    setSocialSaved(true);
    setTimeout(() => setSocialSaved(false), 2000);
  }

  const flagsByCategory = CATEGORIES.map((cat) => ({
    cat,
    flags: (Object.entries(FEATURE_FLAGS) as [FlagKey, typeof FEATURE_FLAGS[FlagKey]][]).filter(
      ([, def]) => def.category === cat
    ),
  }));

  const totalOn = Object.values(flags).filter(Boolean).length;
  const total = Object.keys(flags).length;

  return (
    <div className="mt-12 border-t border-border/60 pt-6">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
      >
        <div className="flex size-6 items-center justify-center rounded-lg bg-secondary/70 group-hover:bg-secondary transition-colors">
          <Settings2 className="size-3.5" />
        </div>
        <span className="font-semibold">🛠 Dev Panel</span>
        <span className="rounded-full bg-secondary/80 px-2 py-0.5 font-mono text-[10px]">
          {totalOn}/{total} on
        </span>
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {open && (
        <div className="mt-4 rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 backdrop-blur-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-cocoa">UI Feature Flags</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Toggle site-wide visual enhancements on/off. Changes save instantly to your browser.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              className="h-7 rounded-lg px-2.5 text-[11px] gap-1"
            >
              <RotateCcw className="size-3" /> Reset all
            </Button>
          </div>

          {/* Feature Flag Groups */}
          <div className="space-y-5">
            {flagsByCategory.map(({ cat, flags: catFlags }) => (
              <div key={cat}>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span>{cat}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {catFlags.map(([key, def]) => (
                    <div
                      key={key}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                        flags[key]
                          ? "border-berry/20 bg-berry/5"
                          : "border-border/50 bg-secondary/20"
                      }`}
                    >
                      <Switch
                        id={key}
                        checked={flags[key]}
                        onCheckedChange={() => toggle(key)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <Label
                          htmlFor={key}
                          className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5 leading-tight"
                        >
                          <span>{def.emoji}</span>
                          <span>{def.label}</span>
                        </Label>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                          {def.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Social Links Editor */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>🔗</span> Social Links
            </p>
            <p className="text-[11px] text-muted-foreground">
              These links appear in the site footer when the Instagram & Social Links flag is enabled.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dev-instagram" className="text-[11px] flex items-center gap-1.5">
                  <Instagram className="size-3 text-pink-500" /> Instagram URL
                </Label>
                <Input
                  id="dev-instagram"
                  value={igInput}
                  onChange={(e) => setIgInput(e.target.value)}
                  placeholder="https://www.instagram.com/yourhandle"
                  className="h-8 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dev-whatsapp" className="text-[11px] flex items-center gap-1.5">
                  <MessageCircle className="size-3 text-emerald-500" /> WhatsApp URL
                </Label>
                <Input
                  id="dev-whatsapp"
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="https://wa.me/91XXXXXXXXXX"
                  className="h-8 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSaveSocial}
              className={`h-7 rounded-lg px-3 text-[11px] gap-1.5 transition-all ${
                socialSaved
                  ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                  : "bg-berry text-berry-foreground hover:bg-berry/90"
              }`}
            >
              <Save className="size-3" />
              {socialSaved ? "Saved!" : "Save social links"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
