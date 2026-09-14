import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IndianRupee, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent, type CakeStudioPricing } from "@/lib/site-content";
import { formatCurrency } from "@/lib/pricing";

/**
 * Prices behind the Design Your Cake studio.
 *
 * The labels here mirror the ids in cake-builder-widget. Only the numbers are
 * editable: the names, colours and garnishes each drive how the preview is
 * drawn, so they stay in code, while the prices — which the bakery actually
 * needs to change — live in site content.
 */
const SIZE_LABELS: Record<string, string> = {
  bento: '4" Bento · serves 2–3',
  layer6: '6" Layer · serves 6–8',
  feast8: '8" Grand · serves 12–16',
  slab: "Feast Slab · serves 10–14",
};

const ADDON_LABELS: Record<string, string> = {
  berries: "🍓 Fresh berries",
  gold: "✨ 24K gold leaf",
  blossoms: "🌸 Buttercream blossoms",
  pearls: "🦪 Sugar pearls",
  spheres: "🍫 Truffle spheres",
  candles: "🕯️ Pastel candles",
};

export function AdminCakePricing() {
  const { content, updateContent, isLoading } = useSiteContent();
  const [draft, setDraft] = useState<CakeStudioPricing | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content?.cake_studio_pricing) setDraft(structuredClone(content.cake_studio_pricing));
  }, [content]);

  if (isLoading || !draft) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
        Loading studio pricing…
      </div>
    );
  }

  const exampleTotal =
    (draft.sizes["layer6"] ?? 0) + (draft.addons["berries"] ?? 0) + (draft.addons["gold"] ?? 0);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await updateContent({ ...content, cake_studio_pricing: draft });
      toast.success("Studio pricing saved. The homepage updates immediately.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  }

  const setSize = (id: string, value: number) =>
    setDraft((d) => (d ? { ...d, sizes: { ...d.sizes, [id]: value } } : d));
  const setAddon = (id: string, value: number) =>
    setDraft((d) => (d ? { ...d, addons: { ...d.addons, [id]: value } } : d));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-blogh text-xl font-bold tracking-wide text-cocoa uppercase">
            Design Your Cake pricing
          </h2>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            What the studio quotes on the homepage. These are estimates shown to customers before
            you confirm an order — changing them here takes effect straight away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              setDraft(
                content?.cake_studio_pricing ? structuredClone(content.cake_studio_pricing) : draft,
              )
            }
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Discard changes
          </Button>
          <Button size="sm" className="rounded-xl font-bold" disabled={saving} onClick={save}>
            <Save className="mr-1.5 size-3.5" />
            {saving ? "Saving…" : "Save pricing"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset className="rounded-3xl border border-border/70 bg-card p-5">
          <legend className="px-1 text-xs font-black tracking-[0.16em] text-muted-foreground uppercase">
            Base price by size
          </legend>
          <div className="mt-2 space-y-2.5">
            {Object.entries(SIZE_LABELS).map(([id, label]) => (
              <label key={id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="relative">
                  <IndianRupee className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={draft.sizes[id] ?? 0}
                    onChange={(e) => setSize(id, Math.max(0, Number(e.target.value)))}
                    className="h-10 w-28 rounded-xl border border-input bg-background pr-3 pl-8 text-sm font-bold tabular-nums focus:ring-2 focus:ring-cocoa/30 focus:outline-none"
                  />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-border/70 bg-card p-5">
          <legend className="px-1 text-xs font-black tracking-[0.16em] text-muted-foreground uppercase">
            Finishing touches
          </legend>
          <div className="mt-2 space-y-2.5">
            {Object.entries(ADDON_LABELS).map(([id, label]) => (
              <label key={id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="relative">
                  <IndianRupee className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={draft.addons[id] ?? 0}
                    onChange={(e) => setAddon(id, Math.max(0, Number(e.target.value)))}
                    className="h-10 w-28 rounded-xl border border-input bg-background pr-3 pl-8 text-sm font-bold tabular-nums focus:ring-2 focus:ring-cocoa/30 focus:outline-none"
                  />
                </span>
              </label>
            ))}

            <label className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <span className="text-sm font-semibold text-foreground">🌱 Eggless surcharge</span>
              <span className="relative">
                <IndianRupee className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.egglessSurcharge}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, egglessSurcharge: Math.max(0, Number(e.target.value)) } : d,
                    )
                  }
                  className="h-10 w-28 rounded-xl border border-input bg-background pr-3 pl-8 text-sm font-bold tabular-nums focus:ring-2 focus:ring-cocoa/30 focus:outline-none"
                />
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <p className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        For reference, a 6&quot; layer cake with fresh berries and gold leaf currently quotes{" "}
        <strong className="text-cocoa">{formatCurrency(exampleTotal)}</strong>.
      </p>
    </div>
  );
}
