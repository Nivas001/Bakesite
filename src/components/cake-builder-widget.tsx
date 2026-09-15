import { useEffect, useState } from "react";
import { Check, Leaf, Link2, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const EGGLESS_SURCHARGE = 60;
const MAX_MESSAGE = 26;

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

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="fade-up">
          <div className="mb-7 max-w-2xl sm:mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-900 dark:text-amber-300">
              <Wand2 className="size-3.5" />
              Design your cake
            </span>
            <h2 className="mt-3 font-nimbus text-3xl font-bold leading-[1.1] text-cocoa sm:text-5xl">
              Build it here. We bake it at dawn.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every choice below redraws the cake on the left. When it looks right, send it over on
              WhatsApp and we will confirm your slot.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-7">
          {/* ------------------------------------------------- live preview */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#2C1810]/12 bg-gradient-to-b from-[#FFF8EE] to-[#FBE9DA] shadow-lift dark:border-white/10 dark:from-[#1E120A] dark:to-[#140B05]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-52 rounded-full bg-amber-300/25 blur-3xl"
                />

                <div className="relative flex items-center justify-between gap-3 px-5 pt-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      Live preview
                    </p>
                    <p className="font-sans text-sm font-bold leading-tight text-cocoa">
                      {flavour.name}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="size-2.5" /> {size.serves}
                  </span>
                </div>

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

                {/* Real bakes in this style. The drawing above shows the exact
                    configuration; these show what it actually looks like. */}
                <div className="relative border-t border-[#2C1810]/10 px-5 pt-3.5 dark:border-white/10">
                  <p className="mb-2 text-[10px] font-black tracking-[0.18em] text-muted-foreground uppercase">
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
                        className="aspect-square w-full rounded-xl border border-border/60 object-cover"
                      />
                    ))}
                  </div>
                </div>

                <div className="relative flex flex-wrap gap-1.5 px-5 py-3.5">
                  <PreviewChip label={size.name} />
                  <PreviewChip label={sponge.name} />
                  {eggless && <PreviewChip label="Eggless" tone="emerald" />}
                  {addons.length > 0 && <PreviewChip label={`${addons.length} garnishes`} />}
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------- controls */}
          <div className="space-y-4 lg:col-span-7">
            <Step index={1} title="Size and servings">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SIZES.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={size.id === option.id}
                    onClick={() => setSize(option)}
                  >
                    <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.serves}</p>
                    <p className="mt-1.5 text-sm font-black text-cocoa">
                      {formatCurrency(basePriceFor(option))}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                      {option.blurb}
                    </p>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step index={2} title="Sponge">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {SPONGES.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={sponge.id === option.id}
                    onClick={() => setSponge(option)}
                  >
                    <span
                      className="mb-2 block size-7 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: option.colour }}
                    />
                    <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step index={3} title="Flavour and cream">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FLAVOURS.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={flavour.id === option.id}
                    onClick={() => setFlavour(option)}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 size-8 shrink-0 rounded-full border-2 border-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${option.frostingLight}, ${option.drip})`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-bold text-foreground">{option.name}</p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {option.cream}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-berry-deep">
                          {option.badge}
                        </p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </Step>

            <Step
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
                        <p className="text-xs font-semibold text-cocoa">
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
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold placeholder:font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-cocoa/30 focus:outline-none"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PRESET_MESSAGES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMessage(preset)}
                    className="min-h-9 cursor-pointer rounded-full bg-secondary/60 px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </Step>

            {/* ------------------------------------------------- order summary */}
            {/* Sticky on narrow screens so the running total and the CTA stay
                in reach while the visitor works through the options. */}
            <div className="sticky bottom-0 z-20 -mx-4 rounded-t-3xl border-2 border-b-0 border-cocoa/15 bg-card/95 p-5 shadow-lift backdrop-blur-md sm:-mx-6 lg:static lg:mx-0 lg:rounded-3xl lg:border-b-2 lg:bg-card lg:backdrop-blur-none">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    Estimated total
                  </p>
                  {/* Rendered directly rather than counted up: a price that
                      reads ₹0 for even a moment is worse than one that simply
                      changes. */}
                  <p className="mt-1 font-nimbus text-4xl leading-none font-bold text-cocoa">
                    {formatCurrency(total)}
                  </p>
                </div>
                <dl className="text-right text-xs text-muted-foreground">
                  <div className="flex justify-end gap-2">
                    <dt>Base</dt>
                    <dd className="font-semibold text-foreground">
                      {formatCurrency(basePriceFor(size))}
                    </dd>
                  </div>
                  <div className="flex justify-end gap-2">
                    <dt>Finishing</dt>
                    <dd className="font-semibold text-foreground">{formatCurrency(addonTotal)}</dd>
                  </div>
                  {eggless && (
                    <div className="flex justify-end gap-2">
                      <dt>Eggless</dt>
                      <dd className="font-semibold text-foreground">
                        {formatCurrency(egglessSurcharge)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <Button
                asChild
                className="mt-4 h-12 w-full cursor-pointer rounded-2xl bg-cocoa text-base font-bold text-background shadow-lift transition-transform hover:scale-[1.01] hover:bg-cocoa/90 active:scale-[0.99]"
              >
                <a
                  href={`https://wa.me/917448724920?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-5 text-emerald-400" />
                  Send this design on WhatsApp
                </a>
              </Button>
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
                className="mt-2 flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-cocoa transition-colors hover:bg-secondary/60"
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

              <p className="mt-2 text-center text-xs text-muted-foreground">
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

function PreviewChip({ label, tone }: { label: string; tone?: "emerald" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-bold",
        tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
          : "border-border/70 bg-card/80 text-cocoa dark:text-foreground",
      )}
    >
      {label}
    </span>
  );
}

function Step({
  index,
  title,
  aside,
  children,
}: {
  index: number;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="fade-up" delay={index * 40}>
      <fieldset className="rounded-3xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
        <legend className="sr-only">{title}</legend>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-cocoa text-xs font-bold text-background">
              {index}
            </span>
            <h3 className="font-sans text-sm font-bold text-foreground sm:text-base">{title}</h3>
          </div>
          {aside && (
            <span className="shrink-0 text-xs font-bold text-muted-foreground">{aside}</span>
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
        "relative min-h-11 cursor-pointer rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-cocoa bg-cocoa/10 ring-2 ring-cocoa"
          : "border-border/80 bg-background/50 hover:border-cocoa/40 hover:bg-secondary/40",
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
