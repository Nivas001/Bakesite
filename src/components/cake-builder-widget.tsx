import { useEffect, useState } from "react";
import { Check, Leaf, Link2, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CakePreview, type CakeShape } from "@/components/cake-studio/cake-preview";
import { formatCurrency } from "@/lib/pricing";
import { useSiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SizeOption {
  id: string;
  name: string;
  serves: string;
  basePrice: number;
  shape: CakeShape;
  blurb: string;
}

interface SpongeOption {
  id: string;
  name: string;
  desc: string;
  colour: string;
}

interface FlavourOption {
  id: string;
  name: string;
  cream: string;
  badge: string;
  frosting: string;
  frostingLight: string;
  drip: string;
  /** Real bakes in this style, so the preview is anchored to photography. */
  photos: string[];
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
  icon: string;
}

const SIZES: SizeOption[] = [
  {
    id: "bento",
    name: '4" Bento',
    serves: "2–3 guests",
    basePrice: 550,
    shape: "bento",
    blurb: "One tier, just for two",
  },
  {
    id: "layer6",
    name: '6" Layer',
    serves: "6–8 guests",
    basePrice: 1250,
    shape: "double",
    blurb: "Two tiers, the classic",
  },
  {
    id: "feast8",
    name: '8" Grand',
    serves: "12–16 guests",
    basePrice: 1850,
    shape: "triple",
    blurb: "Three tiers, full occasion",
  },
  {
    id: "slab",
    name: "Feast Slab",
    serves: "10–14 guests",
    basePrice: 1450,
    shape: "slab",
    blurb: "Low, wide, brownie-dense",
  },
];

const SPONGES: SpongeOption[] = [
  { id: "chiffon", name: "Fluffy Chiffon", desc: "Airy and light", colour: "#F5E3C8" },
  { id: "butter", name: "Heritage Butter", desc: "Velvety crumb", colour: "#EED9AE" },
  { id: "fudge", name: "Belgian Dark Fudge", desc: "Rich chocolate", colour: "#4A2C18" },
];

const FLAVOURS: FlavourOption[] = [
  {
    id: "strawberry",
    name: "Strawberry Vanilla",
    cream: "Whipped berry mascarpone",
    badge: "Signature romance",
    frosting: "#F7C9D3",
    frostingLight: "#FFE9EF",
    drip: "#E05A7A",
    photos: [
      "/cakes/pink-bento-cake.webp",
      "/cakes/coral-heart-cake.webp",
      "/products/strawberry-cake.jpg",
    ],
  },
  {
    id: "truffle",
    name: "70% Belgian Truffle",
    cream: "Dark cocoa ganache drip",
    badge: "Rich decadence",
    frosting: "#7A5638",
    frostingLight: "#A87F57",
    drip: "#2A150C",
    photos: [
      "/cakes/belgian-truffle-cake.webp",
      "/cakes/royal-gold-brownie.webp",
      "/products/chocolate-cake.jpg",
    ],
  },
  {
    id: "lavender",
    name: "Lavender Pearl",
    cream: "French buttercream and berries",
    badge: "Artisan floral",
    frosting: "#CDBDE6",
    frostingLight: "#EBE2F8",
    drip: "#7C5FA8",
    photos: [
      "/cakes/lavender-pearl-cake.webp",
      "/cakes/butterfly-lilac-cake.webp",
      "/products/vanilla-cake.jpg",
    ],
  },
  {
    id: "biscoff",
    name: "Pistachio Biscoff",
    cream: "Caramel lotus feathering",
    badge: "Celebration crunch",
    frosting: "#E3B57E",
    frostingLight: "#F8E2C2",
    drip: "#9C5B22",
    photos: [
      "/cakes/biscoff-herringbone-cake.webp",
      "/cakes/biscoff-nut-brownie.webp",
      "/products/rosemilk-tea-cake.jpg",
    ],
  },
];

const ADDONS: AddonOption[] = [
  { id: "berries", name: "Fresh berries", price: 100, icon: "🍓" },
  { id: "gold", name: "24K gold leaf", price: 120, icon: "✨" },
  { id: "blossoms", name: "Buttercream blossoms", price: 80, icon: "🌸" },
  { id: "pearls", name: "Sugar pearls", price: 50, icon: "🦪" },
  { id: "spheres", name: "Truffle spheres", price: 150, icon: "🍫" },
  { id: "candles", name: "Pastel candles", price: 40, icon: "🕯️" },
];

const PRESET_MESSAGES = ["Happy Birthday", "Happy Anniversary", "Congratulations", "Best Mum Ever"];

const STEPS = [
  { id: "size", label: "Size" },
  { id: "sponge", label: "Sponge" },
  { id: "flavour", label: "Flavour" },
  { id: "finish", label: "Finish" },
  { id: "message", label: "Message" },
] as const;

const EGGLESS_SURCHARGE = 60;
const MAX_MESSAGE = 26;
const WHATSAPP_NUMBER = "917448724920";

/** Everything needed to rebuild a design, kept short enough for a URL. */
interface CakeConfig {
  size: string;
  sponge: string;
  flavour: string;
  addons: string[];
  eggless: boolean;
  message: string;
}

const CONFIG_KEY = "cake";

/**
 * Reads a shared design out of the URL hash.
 *
 * The hash is used rather than a query string so this works without the route
 * declaring search params, and so sharing a design never triggers a navigation.
 */
function readConfigFromUrl(): Partial<CakeConfig> | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.hash.replace(/^#/, "")).get(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw)))) as Partial<CakeConfig>;
  } catch {
    return null;
  }
}

function writeConfigToUrl(config: CakeConfig): void {
  if (typeof window === "undefined") return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  params.set(CONFIG_KEY, encoded);
  // replaceState, so dragging through options does not fill the back button.
  window.history.replaceState(null, "", `${window.location.pathname}#${params.toString()}`);
}

/**
 * The design-your-own-cake studio.
 *
 * Rebuilt as a bench: the drawing of the cake sits on the left under a header
 * that reads like an order docket, and the choices run down the right as five
 * numbered steps with a jump rail above them. The running total is docked to
 * the bottom of the viewport on phones and to the column on desktop, so the
 * price is never more than a glance away while the options are being worked
 * through.
 */
export function CakeBuilderWidget() {
  const [size, setSize] = useState<SizeOption>(SIZES[1]!);
  const [sponge, setSponge] = useState<SpongeOption>(SPONGES[0]!);
  const [flavour, setFlavour] = useState<FlavourOption>(FLAVOURS[0]!);
  const [addons, setAddons] = useState<string[]>(["berries", "gold"]);
  const [eggless, setEggless] = useState(false);
  const [message, setMessage] = useState("Happy Birthday");
  const [copied, setCopied] = useState(false);

  // Prices come from site content so the bakery can change them without a
  // deploy; the values in SIZES/ADDONS are the fallback.
  const { content: siteContent } = useSiteContent();
  const pricing = siteContent.cake_studio_pricing;
  const basePriceFor = (option: SizeOption) => pricing?.sizes?.[option.id] ?? option.basePrice;
  const addonPriceFor = (option: AddonOption) => pricing?.addons?.[option.id] ?? option.price;
  const egglessSurcharge = pricing?.egglessSurcharge ?? EGGLESS_SURCHARGE;

  // Restore a shared or previously-open design. Runs once: after this the URL
  // follows the state rather than the other way round.
  useEffect(() => {
    const shared = readConfigFromUrl();
    if (!shared) return;
    const nextSize = SIZES.find((o) => o.id === shared.size);
    const nextSponge = SPONGES.find((o) => o.id === shared.sponge);
    const nextFlavour = FLAVOURS.find((o) => o.id === shared.flavour);
    if (nextSize) setSize(nextSize);
    if (nextSponge) setSponge(nextSponge);
    if (nextFlavour) setFlavour(nextFlavour);
    if (Array.isArray(shared.addons)) {
      setAddons(shared.addons.filter((id) => ADDONS.some((a) => a.id === id)));
    }
    if (typeof shared.eggless === "boolean") setEggless(shared.eggless);
    if (typeof shared.message === "string") setMessage(shared.message.slice(0, MAX_MESSAGE));
  }, []);

  // Keep the address bar in step, so the design survives a refresh and the link
  // can simply be copied.
  useEffect(() => {
    writeConfigToUrl({
      size: size.id,
      sponge: sponge.id,
      flavour: flavour.id,
      addons,
      eggless,
      message,
    });
  }, [size, sponge, flavour, addons, eggless, message]);

  function toggleAddon(id: string) {
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const addonTotal = addons.reduce((sum, id) => {
    const option = ADDONS.find((a) => a.id === id);
    return sum + (option ? addonPriceFor(option) : 0);
  }, 0);
  const total = basePriceFor(size) + addonTotal + (eggless ? egglessSurcharge : 0);

  const addonNames = addons
    .map((id) => ADDONS.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const whatsappText = encodeURIComponent(
    `Hi Aniii Bakes! I designed a cake in your studio:\n\n` +
      `• Size: ${size.name} (${size.serves})\n` +
      `• Sponge: ${sponge.name}\n` +
      `• Flavour: ${flavour.name} — ${flavour.cream}\n` +
      `• Finishing: ${addonNames || "Clean finish"}\n` +
      `• Dietary: ${eggless ? "Eggless" : "Standard egg recipe"}\n` +
      `• Inscription: "${message.trim() || "None"}"\n` +
      `• Estimate: ${formatCurrency(total)}\n\n` +
      `Could you confirm slot availability?`,
  );

  function jumpToStep(id: string) {
    document.getElementById(`cake-step-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Heading ───────────────────────────────────────────────── */}
        <Reveal variant="fade-up">
          <div className="mb-6 flex flex-col gap-4 sm:mb-9 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1 text-[11px] font-black tracking-[0.18em] text-amber-900 uppercase dark:text-amber-300">
                <Wand2 className="size-3.5" />
                Design your cake
              </span>
              <h2 className="mt-3 font-nimbus text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.05] font-bold text-cocoa">
                Build it here. We bake it at dawn.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Every choice below redraws the cake beside it. When it looks right, send it over on
                WhatsApp and we will confirm your slot.
              </p>
            </div>

            {/* Jump rail — five steps, tappable, so a long form has a map. */}
            <nav aria-label="Jump to a step" className="shrink-0">
              <ol className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
                {STEPS.map((step, index) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => jumpToStep(step.id)}
                      className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-[11px] font-bold whitespace-nowrap text-cocoa shadow-2xs transition-colors hover:border-cocoa/40 hover:bg-secondary/60"
                    >
                      <span className="grid size-4 place-items-center rounded-full bg-cocoa text-[9px] font-black text-background">
                        {index + 1}
                      </span>
                      {step.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-7">
          {/* ── Live preview ────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#2C1810]/12 bg-linear-to-b from-[#FFF8EE] to-[#FBE9DA] shadow-lift dark:border-white/10 dark:from-[#1E120A] dark:to-[#140B05]">
                <div
                  aria-hidden
                  className="worktop-grid pointer-events-none absolute inset-0 opacity-60"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-52 rounded-full bg-amber-300/25 blur-3xl"
                />

                {/* Docket header */}
                <div className="relative flex items-center justify-between gap-3 border-b border-dashed border-[#2C1810]/12 px-5 py-3.5 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                      Your design
                    </p>
                    <p className="truncate font-sans text-sm leading-tight font-bold text-cocoa">
                      {size.name} · {flavour.name}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="size-2.5" /> {size.serves}
                  </span>
                </div>

                {/* The drawing */}
                <div className="relative mx-auto aspect-square w-full max-w-sm px-3">
                  <CakePreview
                    shape={size.shape}
                    frosting={flavour.frosting}
                    frostingLight={flavour.frostingLight}
                    drip={flavour.drip}
                    sponge={sponge.colour}
                    addons={addons}
                    message={message}
                  />
                </div>

                {/* A running spec of the current design, so what has been
                    chosen is readable without scrolling back up the steps. */}
                <dl className="relative grid grid-cols-2 gap-x-4 gap-y-2 border-t border-dashed border-[#2C1810]/12 px-5 py-3.5 text-xs dark:border-white/10">
                  <SpecRow label="Sponge" value={sponge.name} />
                  <SpecRow label="Cream" value={flavour.cream} />
                  <SpecRow
                    label="Finishing"
                    value={addons.length ? `${addons.length} garnishes` : "Clean finish"}
                  />
                  <SpecRow label="Recipe" value={eggless ? "Eggless" : "Standard egg"} />
                  {message.trim() && (
                    <div className="col-span-2">
                      <dt className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Piped
                      </dt>
                      <dd className="truncate font-script text-base text-cocoa dark:text-foreground">
                        “{message.trim()}”
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Real bakes in this style. The drawing above shows the exact
                    configuration; these show what it actually looks like. */}
                <div className="relative border-t border-[#2C1810]/10 px-5 pt-3.5 pb-4 dark:border-white/10">
                  <p className="mb-2 font-mono text-[10px] font-black tracking-[0.18em] text-muted-foreground uppercase">
                    Bakes we have made in this style
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {flavour.photos.map((photo) => (
                      <img
                        key={photo}
                        src={photo}
                        alt={`An Aniii Bakes cake in the ${flavour.name} style`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full rounded-xl border border-border/60 object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Controls ────────────────────────────────────────────── */}
          <div className="space-y-4 lg:col-span-7">
            <Step id="size" index={1} title="Size and servings" aside={size.name}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SIZES.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={size.id === option.id}
                    onClick={() => setSize(option)}
                  >
                    <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.serves}</p>
                    <p className="mt-1.5 font-mono text-sm font-black text-cocoa tabular-nums dark:text-foreground">
                      {formatCurrency(basePriceFor(option))}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                      {option.blurb}
                    </p>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step id="sponge" index={2} title="Sponge" aside={sponge.name}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {SPONGES.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={sponge.id === option.id}
                    onClick={() => setSponge(option)}
                  >
                    <span
                      className="mb-2 block size-8 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: option.colour }}
                    />
                    <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step id="flavour" index={3} title="Flavour and cream" aside={flavour.name}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FLAVOURS.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={flavour.id === option.id}
                    onClick={() => setFlavour(option)}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 size-9 shrink-0 rounded-full border-2 border-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${option.frostingLight}, ${option.drip})`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {option.cream}
                        </p>
                        <p className="mt-1 font-mono text-[10px] font-black tracking-wider text-berry-deep uppercase">
                          {option.badge}
                        </p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step
              id="finish"
              index={4}
              title="Finishing touches"
              aside={addonTotal > 0 ? `+${formatCurrency(addonTotal)}` : "Optional"}
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {ADDONS.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={addons.includes(option.id)}
                    onClick={() => toggleAddon(option.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{option.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-xs font-bold text-foreground">
                          {option.name}
                        </p>
                        <p className="font-mono text-xs font-bold text-cocoa tabular-nums dark:text-foreground">
                          +₹{addonPriceFor(option)}
                        </p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setEggless(!eggless)}
                aria-pressed={eggless}
                className={cn(
                  "mt-2.5 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all",
                  eggless
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-border/80 bg-background/50 text-foreground hover:bg-secondary/60",
                )}
              >
                <Leaf className={cn("size-4", eggless ? "text-white" : "text-emerald-500")} />
                {eggless
                  ? `Eggless recipe · +${formatCurrency(egglessSurcharge)}`
                  : `Make it eggless · +${formatCurrency(egglessSurcharge)}`}
              </button>
            </Step>

            <Step
              id="message"
              index={5}
              title="Hand-piped inscription"
              aside={`${message.length}/${MAX_MESSAGE}`}
            >
              <label htmlFor="cake-message" className="sr-only">
                Message to pipe on the cake
              </label>
              <input
                id="cake-message"
                type="text"
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Happy 25th, Maya"
                className="h-12 w-full rounded-xl border border-input bg-background px-4 font-script text-xl placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-cocoa/30 focus:outline-none"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PRESET_MESSAGES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMessage(preset)}
                    aria-pressed={message === preset}
                    className={cn(
                      "min-h-9 cursor-pointer rounded-full px-3.5 text-xs font-semibold transition-colors",
                      message === preset
                        ? "bg-cocoa text-background"
                        : "bg-secondary/60 text-foreground hover:bg-secondary",
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </Step>

            {/* ── Order docket ──────────────────────────────────────── */}
            {/* Sticky on narrow screens so the running total and the CTA stay
                in reach while the visitor works through the options. */}
            <div className="sticky bottom-0 z-20 -mx-4 overflow-hidden rounded-t-3xl border-2 border-b-0 border-cocoa/15 bg-card/95 shadow-lift backdrop-blur-md sm:-mx-6 lg:static lg:mx-0 lg:rounded-3xl lg:border-b-2 lg:bg-card lg:backdrop-blur-none">
              <div className="p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-black tracking-[0.18em] text-muted-foreground uppercase">
                      Estimated total
                    </p>
                    {/* Rendered directly rather than counted up: a price that
                        reads ₹0 for even a moment is worse than one that simply
                        changes. */}
                    <p className="mt-1 font-nimbus text-4xl leading-none font-bold text-cocoa dark:text-foreground">
                      {formatCurrency(total)}
                    </p>
                  </div>
                  <dl className="space-y-0.5 text-right text-xs text-muted-foreground">
                    <div className="flex justify-end gap-3">
                      <dt>Base · {size.name}</dt>
                      <dd className="font-mono font-semibold text-foreground tabular-nums">
                        {formatCurrency(basePriceFor(size))}
                      </dd>
                    </div>
                    <div className="flex justify-end gap-3">
                      <dt>Finishing · {addons.length}</dt>
                      <dd className="font-mono font-semibold text-foreground tabular-nums">
                        {formatCurrency(addonTotal)}
                      </dd>
                    </div>
                    {eggless && (
                      <div className="flex justify-end gap-3">
                        <dt>Eggless</dt>
                        <dd className="font-mono font-semibold text-foreground tabular-nums">
                          {formatCurrency(egglessSurcharge)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative mt-4 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-cocoa text-base font-bold text-background shadow-lift transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <MessageCircle className="size-5 text-emerald-400" />
                  Send this design on WhatsApp
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/20 opacity-0 group-hover:animate-sheen-sweep group-hover:opacity-100"
                  />
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2500);
                    } catch {
                      setCopied(false);
                    }
                  }}
                  className="mt-2 flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-cocoa transition-colors hover:bg-secondary/60 dark:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" /> Link copied
                    </>
                  ) : (
                    <>
                      <Link2 className="size-3.5" /> Copy a link to this design
                    </>
                  )}
                </button>
              </div>

              <p className="border-t border-dashed border-border/70 bg-secondary/35 px-5 py-2.5 text-center text-xs text-muted-foreground">
                An estimate, not a charge. We confirm the final price and your slot before anything
                is baked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="truncate text-[13px] font-bold text-cocoa dark:text-foreground">{value}</dd>
    </div>
  );
}

function Step({
  id,
  index,
  title,
  aside,
  children,
}: {
  id: string;
  index: number;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="fade-up" delay={index * 40}>
      <fieldset
        id={`cake-step-${id}`}
        className="scroll-mt-24 rounded-3xl border border-border/80 bg-card p-4 shadow-soft sm:p-5"
      >
        <legend className="sr-only">{title}</legend>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-xs font-bold text-background">
              {index}
            </span>
            <h3 className="font-sans text-sm font-bold text-foreground sm:text-base">{title}</h3>
          </div>
          {aside && (
            <span className="max-w-[45%] shrink-0 truncate rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-bold text-cocoa dark:text-foreground">
              {aside}
            </span>
          )}
        </div>
        {children}
      </fieldset>
    </Reveal>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative min-h-11 cursor-pointer overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200",
        selected
          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa"
          : "border-border/80 bg-background/50 hover:-translate-y-0.5 hover:border-cocoa/40 hover:bg-secondary/40 hover:shadow-soft",
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-cocoa text-background">
          <Check className="size-2.5" />
        </span>
      )}
      {children}
    </button>
  );
}
