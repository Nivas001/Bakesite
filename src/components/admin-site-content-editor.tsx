import { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Flame,
  ArrowRight,
  RotateCcw,
  Save,
  Check,
  Monitor,
  Smartphone,
  Copy,
  Eye,
  FileText,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useSiteContent,
  DEFAULT_SITE_CONTENT,
  SiteContent,
  SectionContent,
} from "@/lib/site-content";

type SectionKey = keyof SiteContent;

interface SectionConfig {
  key: SectionKey;
  page: "Homepage" | "About Page";
  name: string;
  badgeLabel: string;
  titleLabel: string;
  descLabel: string;
  icon: typeof Sparkles;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "home_lab",
    page: "Homepage",
    name: "1. The Artisan Bakery Laboratory",
    badgeLabel: "Eyebrow Tag",
    titleLabel: "Main Headline",
    descLabel: "Sub-Headline / Description",
    icon: Flame,
  },
  {
    key: "home_faq",
    page: "Homepage",
    name: "2. Frequently Asked Questions",
    badgeLabel: "Badge Text",
    titleLabel: "Section Title",
    descLabel: "Subtitle / Description",
    icon: HelpCircle,
  },
  {
    key: "home_cta",
    page: "Homepage",
    name: "3. Tomorrow Morning CTA Banner",
    badgeLabel: "Badge Text",
    titleLabel: "Call-to-Action Headline",
    descLabel: "Supporting Copy",
    icon: Sparkles,
  },
  {
    key: "about_3d",
    page: "About Page",
    name: "4. Interactive 3D Cake Atelier",
    badgeLabel: "Badge Text",
    titleLabel: "Atelier Title",
    descLabel: "Description",
    icon: Compass,
  },
  {
    key: "about_delivery",
    page: "About Page",
    name: "5. Safe & Intact Delivery Shield",
    badgeLabel: "Badge Text",
    titleLabel: "Delivery Headline",
    descLabel: "Packaging Description",
    icon: ShieldCheck,
  },
];

export function AdminSiteContentEditor() {
  const { content, updateContent, resetContent, isLoading } = useSiteContent();
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>("home_lab");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [formState, setFormState] = useState<SiteContent>(content);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal state when server content changes if not dirty
  useEffect(() => {
    if (!isDirty && content) {
      setFormState(content);
    }
  }, [content, isDirty]);

  const activeConfig = SECTION_CONFIGS.find((c) => c.key === activeSectionKey)!;
  const currentSection = formState[activeSectionKey] || DEFAULT_SITE_CONTENT[activeSectionKey];

  const handleFieldChange = (field: keyof SectionContent, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [activeSectionKey]: {
        ...prev[activeSectionKey],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateContent(formState);
      setIsDirty(false);
      toast.success("✨ Website text updated & permanently synchronized live!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save site text to server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSection = () => {
    setFormState((prev) => ({
      ...prev,
      [activeSectionKey]: DEFAULT_SITE_CONTENT[activeSectionKey],
    }));
    setIsDirty(true);
    toast.info(`Reset "${activeConfig.name}" to default copy.`);
  };

  const handleResetAll = async () => {
    if (confirm("Reset all website section texts back to factory defaults?")) {
      try {
        setIsSaving(true);
        await resetContent();
        setFormState(DEFAULT_SITE_CONTENT);
        setIsDirty(false);
        toast.success("All sections restored to factory defaults.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to reset site text");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formState, null, 2));
    toast.success("Site content JSON copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-berry/10 text-berry font-bold">
              <FileText className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold text-cocoa">
              Page Text & Copywriting Studio
            </h2>
            <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
              Advanced Tool
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Customize key headlines, subtitles, and badges for the Homepage and About Page with live split-screen preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="rounded-xl text-xs font-semibold h-9 cursor-pointer"
          >
            <Copy className="size-3.5 mr-1.5" />
            Copy JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="rounded-xl text-xs font-semibold h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset All Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="rounded-xl text-xs font-bold h-9 bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer disabled:opacity-50"
          >
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? "Saving to Server…" : isDirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {SECTION_CONFIGS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSectionKey === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSectionKey(sec.key)}
              className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                isActive
                  ? "border-berry bg-berry/5 ring-2 ring-berry/20 shadow-xs"
                  : "border-border/80 bg-card hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {sec.page}
                </span>
                <Icon className={`size-3.5 ${isActive ? "text-berry" : "text-muted-foreground"}`} />
              </div>
              <p className={`text-xs font-bold line-clamp-1 ${isActive ? "text-cocoa font-extrabold" : "text-muted-foreground"}`}>
                {sec.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Split-Screen Studio: Left Form & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Form Editor (5 Columns) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry">
                {activeConfig.page} Section
              </span>
              <h3 className="font-display text-lg font-bold text-cocoa">
                {activeConfig.name}
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetSection}
              className="text-[11px] h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset Section
            </Button>
          </div>

          <div className="space-y-4">
            {/* Badge / Eyebrow Input */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sec-badge" className="text-xs font-bold text-cocoa">
                  {activeConfig.badgeLabel}
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentSection.badge?.length || 0} chars
                </span>
              </div>
              <Input
                id="sec-badge"
                value={currentSection.badge || ""}
                placeholder="e.g. Pure Craft & Cold Fermentation"
                className="mt-1.5 h-10 rounded-xl text-xs"
                onChange={(e) => handleFieldChange("badge", e.target.value)}
              />
            </div>

            {/* Main Headline / Title Input */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sec-title" className="text-xs font-bold text-cocoa">
                  {activeConfig.titleLabel} <span className="text-berry">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentSection.title?.length || 0} chars
                </span>
              </div>
              <Input
                id="sec-title"
                value={currentSection.title || ""}
                placeholder="e.g. The artisan bakery laboratory"
                className="mt-1.5 h-10 rounded-xl text-xs font-semibold"
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
            </div>

            {/* Description / Subtitle Input */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sec-desc" className="text-xs font-bold text-cocoa">
                  {activeConfig.descLabel}
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentSection.description?.length || 0} chars
                </span>
              </div>
              <Textarea
                id="sec-desc"
                rows={4}
                value={currentSection.description || ""}
                placeholder="Supporting description or explanation copy…"
                className="mt-1.5 rounded-xl text-xs leading-relaxed"
                onChange={(e) => handleFieldChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {isDirty ? "⚠️ Unsaved changes" : "✅ All changes live in sync"}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className="rounded-xl text-xs font-bold bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer"
            >
              <Save className="size-3.5 mr-1.5" />
              Apply to Site
            </Button>
          </div>
        </div>

        {/* Right Side: Live Interactive Viewport Preview (7 Columns) */}
        <div className="lg:col-span-7 space-y-3 sticky top-24">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-cocoa">
                Live Rendered Preview
              </span>
            </div>

            <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="size-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="size-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Device Frame */}
          <div
            className={`mx-auto rounded-3xl border-2 border-border/80 bg-background overflow-hidden shadow-lift transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-sm" : "w-full"
            }`}
          >
            {/* Mock Browser Header */}
            <div className="h-8 bg-secondary/60 border-b border-border/60 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-400" />
                <span className="size-2 rounded-full bg-amber-400" />
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-mono font-medium text-muted-foreground">
                {activeConfig.page === "Homepage" ? "anibakes.com/" : "anibakes.com/about"}
              </span>
              <span className="text-[10px] text-muted-foreground">100%</span>
            </div>

            {/* Dynamic Section Mock View */}
            <div className="p-4 sm:p-6 overflow-hidden">
              
              {/* Preview 1: The Artisan Bakery Laboratory */}
              {activeSectionKey === "home_lab" && (
                <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-[#FFFDF9] to-[#FFF4E8] dark:from-card dark:to-amber-950/20 p-5 space-y-4 shadow-soft">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-berry block mb-1">
                      {currentSection.badge || "Pure Craft & Cold Fermentation"}
                    </span>
                    <h2 className="font-blogh text-xl sm:text-3xl font-bold text-cocoa leading-tight uppercase tracking-wide">
                      {currentSection.title || "The artisan bakery laboratory"}
                    </h2>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-md">
                      {currentSection.description || "No shortcuts, zero chemical improvers. Just wild fermentation, stone-ground flour, and real French butter."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-xl border border-amber-200/80 bg-card p-3 shadow-2xs">
                      <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase">🔥 36h Wild Ferment</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Slow cold retarder proofing</p>
                    </div>
                    <div className="rounded-xl border border-amber-200/80 bg-card p-3 shadow-2xs">
                      <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase">🧈 French Butter</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">84% high fat laminating butter</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 2: Frequently Asked Questions */}
              {activeSectionKey === "home_faq" && (
                <div className="rounded-2xl border-2 border-[#2C1810]/15 bg-gradient-to-br from-[#FFF9F3] via-[#FFF5EC] to-[#FFEEE0] dark:from-[#1A1008] dark:to-[#1B0F09] p-5 space-y-4 shadow-soft">
                  <div className="text-center max-w-md mx-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 border border-border/80 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cocoa shadow-2xs">
                      <HelpCircle className="size-3 text-berry" /> {currentSection.badge || "Clear Answers"}
                    </span>
                    <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-cocoa">
                      {currentSection.title || "Frequently asked questions"}
                    </h2>
                    <p className="mt-1 text-xs text-cocoa/75 dark:text-muted-foreground leading-relaxed">
                      {currentSection.description || "Everything you need to know about freshness, morning slots, and delivery."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl border border-border/80 bg-card p-3 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-cocoa">How fresh are the bakes when they reach my door?</span>
                      <span className="text-xs text-muted-foreground font-bold">+</span>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-card p-3 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-cocoa">How do next-day delivery and pickup slots work?</span>
                      <span className="text-xs text-muted-foreground font-bold">+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 3: Tomorrow Morning CTA Banner */}
              {activeSectionKey === "home_cta" && (
                <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-[#FFF9F4] to-secondary/40 p-6 text-center shadow-lift space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-berry shadow-2xs">
                    <Sparkles className="size-3 text-berry" /> {currentSection.badge || "Fresh Mornings"}
                  </span>
                  <h2 className="font-blogh text-xl sm:text-2xl font-bold leading-tight text-cocoa uppercase tracking-wide">
                    {currentSection.title || "Tomorrow morning could smell a lot better."}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {currentSection.description || "Reserve your next-day slot now. We mix and bake fresh at dawn for your chosen arrival window."}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <div className="rounded-xl bg-[#2C1810] text-white px-4 py-2 text-xs font-bold shadow-soft">
                      Start your bake box &rarr;
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 4: Interactive 3D Cake Atelier */}
              {activeSectionKey === "about_3d" && (
                <div className="rounded-2xl border-[2.5px] border-[#2C1810] bg-gradient-to-b from-[#1C120C] via-[#2A1810] to-[#180E08] text-white p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-nimbus text-base text-amber-300 uppercase tracking-wide">
                        {currentSection.title || "Interactive 3D Cake Atelier"}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-200 text-[10px] font-mono">
                      360° Orbit
                    </span>
                  </div>

                  <div className="h-32 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center p-3">
                    <span className="text-3xl">🎂</span>
                    <p className="text-[11px] text-amber-200/80 mt-1">
                      {currentSection.description || "Explore signature wellness bakes in 3D."}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview 5: Safe & Intact Delivery Shield */}
              {activeSectionKey === "about_delivery" && (
                <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-soft text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    <ShieldCheck className="size-3.5 text-sky-600" />
                    <span>{currentSection.badge || "Safe & Damage-Proof Courier Shield"}</span>
                  </div>
                  <h2 className="font-blogh text-xl font-bold text-cocoa leading-tight uppercase tracking-wide">
                    {currentSection.title || "How we deliver your bakes 100% safe & intact"}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                    {currentSection.description || "Delicate croissants, moist multi-layer cakes, and artisanal brownie slabs require precision engineering to travel from our dawn hearth to your celebration table."}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    <span>Standard on every order</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
