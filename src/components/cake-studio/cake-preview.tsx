import { useId } from "react";
import { cn } from "@/lib/utils";

export type CakeShape = "bento" | "double" | "triple" | "slab";

export interface CakePreviewProps {
  shape: CakeShape;
  /** Outer frosting colour. */
  frosting: string;
  /** Lighter tone used for the top surface and highlights. */
  frostingLight: string;
  /** Ganache / drip colour running over the top edge. */
  drip: string;
  /** Colour of the sponge visible at the base trim. */
  sponge: string;
  /** Add-on ids that are currently selected. */
  addons: string[];
  /** Hand-piped inscription. Empty renders an unlettered plaque. */
  message: string;
  candles?: number;
  className?: string;
}

/** One drawn tier: horizontal centre, top edge, width and height. */
interface TierBox {
  cx: number;
  top: number;
  w: number;
  h: number;
}

const VIEW_W = 400;
const VIEW_H = 380;
const BASE_Y = 300;

/** How squashed the top-surface ellipse is relative to the tier width. */
const PERSPECTIVE = 0.17;

function tiersFor(shape: CakeShape): TierBox[] {
  switch (shape) {
    case "bento":
      return [{ cx: 200, top: 182, w: 176, h: 118 }];
    case "double":
      return [
        { cx: 200, top: 188, w: 220, h: 112 },
        { cx: 200, top: 104, w: 150, h: 84 },
      ];
    case "triple":
      return [
        { cx: 200, top: 204, w: 248, h: 96 },
        { cx: 200, top: 128, w: 182, h: 76 },
        { cx: 200, top: 60, w: 122, h: 68 },
      ];
    case "slab":
      return [{ cx: 200, top: 208, w: 286, h: 92 }];
  }
}

/** Silhouette of one cylindrical tier, closed flat across the top. The top
 *  surface ellipse is drawn over it so the back rim reads correctly. */
function tierSide({ cx, top, w, h }: TierBox): string {
  const rx = w / 2;
  const ry = rx * PERSPECTIVE;
  const bottom = top + h;
  return [
    `M ${cx - rx} ${top}`,
    `L ${cx - rx} ${bottom}`,
    `A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}`,
    `L ${cx + rx} ${top}`,
    "Z",
  ].join(" ");
}

/**
 * A band of ganache hanging over the front edge of a tier.
 *
 * Drip depths are derived from the tier index so the same configuration always
 * draws the same cake, while still looking hand-poured rather than uniform.
 */
function dripBand({ cx, top, w }: TierBox, seed: number): string {
  const rx = w / 2;
  const ry = rx * PERSPECTIVE;
  const count = Math.max(7, Math.round(w / 15));
  const shoulder = top + ry * 0.9;

  const parts: string[] = [`M ${cx - rx} ${top}`];

  // Follow the front of the top ellipse down to the shoulder line.
  parts.push(`A ${rx} ${ry} 0 0 0 ${cx + rx} ${top}`);
  parts.push(`L ${cx + rx} ${shoulder}`);

  // Then walk back across the front, hanging one drip per step.
  for (let i = count; i >= 1; i -= 1) {
    const x1 = cx - rx + ((i - 1) / count) * w;
    const x2 = cx - rx + (i / count) * w;
    const mid = (x1 + x2) / 2;
    // Two out of phase sine terms give a few long runs between many short
    // ones, which is how poured ganache actually falls.
    const n = Math.sin(i * 12.9898 + seed * 4.1) * 0.5 + 0.5;
    const m = Math.sin(i * 4.137 + seed * 2.3) * 0.5 + 0.5;
    const depth = 4 + n * n * n * 30 + m * 5;
    parts.push(`L ${x2} ${shoulder}`);
    parts.push(`Q ${mid} ${shoulder + depth * 1.6} ${x1} ${shoulder}`);
  }

  parts.push(`L ${cx - rx} ${top}`, "Z");
  return parts.join(" ");
}

/** Positions for decorations arranged around the top surface of a tier. */
function crownSpots({ cx, top, w }: TierBox, count: number): Array<[number, number]> {
  const rx = w / 2;
  const ry = rx * PERSPECTIVE;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + 0.5;
    return [cx + Math.cos(angle) * rx * 0.6, top + Math.sin(angle) * ry * 0.85] as [number, number];
  });
}

/**
 * A live drawing of the cake currently configured in the studio.
 *
 * Everything on screen is driven by the props — tier count and proportions from
 * the size, colours from the flavour, and each add-on adding its own garnish —
 * so the preview is an actual representation of the order rather than a stock
 * photograph that ignores the controls.
 */
export function CakePreview({
  shape,
  frosting,
  frostingLight,
  drip,
  sponge,
  addons,
  message,
  candles = 0,
  className,
}: CakePreviewProps) {
  // ids must be unique per instance or multiple previews share gradients
  const uid = useId().replace(/:/g, "");
  const tiers = tiersFor(shape);
  const topTier = tiers[tiers.length - 1]!;
  const bottomTier = tiers[0]!;

  const has = (id: string) => addons.includes(id);
  const isSlab = shape === "slab";

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={cn("size-full", className)}
      role="img"
      aria-label={
        message.trim()
          ? `Preview of the configured cake, inscribed "${message.trim()}"`
          : "Preview of the configured cake"
      }
    >
      <defs>
        <linearGradient id={`frost-${uid}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor={frostingLight} />
          <stop offset="42%" stopColor={frosting} />
          <stop offset="100%" stopColor={frosting} stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id={`drip-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={drip} />
          <stop offset="100%" stopColor={drip} stopOpacity="0.86" />
        </linearGradient>
        <radialGradient id={`plate-${uid}`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#F3E3C0" />
          <stop offset="100%" stopColor="#CBAE78" />
        </radialGradient>
        <radialGradient id={`shade-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#2C1810" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2C1810" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact shadow */}
      <ellipse cx="200" cy={BASE_Y + 30} rx="150" ry="26" fill={`url(#shade-${uid})`} />

      {/* Cake stand */}
      <ellipse cx="200" cy={BASE_Y} rx="146" ry="22" fill={`url(#plate-${uid})`} />
      <ellipse cx="200" cy={BASE_Y - 4} rx="146" ry="22" fill="#F7EBD2" />
      <path d="M 170 306 L 178 340 L 222 340 L 230 306 Z" fill="#D9C08A" />
      <ellipse cx="200" cy="342" rx="46" ry="10" fill="#CBAE78" />

      {/* Tiers, bottom first */}
      {tiers.map((tier, i) => {
        const rx = tier.w / 2;
        const ry = rx * PERSPECTIVE;
        const below = tiers[i - 1];
        return (
          <g key={i}>
            {/* Contact shadow cast onto the tier underneath */}
            {below && (
              <ellipse
                cx={tier.cx}
                cy={tier.top + tier.h}
                rx={rx * 1.16}
                ry={ry * 1.2}
                fill="#2C1810"
                opacity="0.16"
              />
            )}

            {/* Sponge trim peeking out at the base of the bottom tier */}
            {i === 0 && (
              <path
                d={tierSide({ ...tier, top: tier.top + tier.h - 14, h: 14 })}
                fill={sponge}
                opacity="0.95"
              />
            )}

            <path d={tierSide(tier)} fill={`url(#frost-${uid})`} />

            {/* Vertical comb texture on the frosting */}
            {Array.from({ length: Math.round(tier.w / 16) }, (_, k) => {
              const x = tier.cx - rx + 8 + k * 16;
              return (
                <line
                  key={k}
                  x1={x}
                  y1={tier.top + 4}
                  x2={x}
                  y2={tier.top + tier.h - 6}
                  stroke={frostingLight}
                  strokeOpacity="0.28"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            <path d={dripBand(tier, i)} fill={`url(#drip-${uid})`} />
            <ellipse cx={tier.cx} cy={tier.top} rx={rx} ry={ry} fill={drip} />
            <ellipse
              cx={tier.cx}
              cy={tier.top - 1}
              rx={rx * 0.88}
              ry={ry * 0.82}
              fill={frostingLight}
              opacity="0.28"
            />
          </g>
        );
      })}

      {/* Buttercream blossom rosettes around the base */}
      {has("blossoms") &&
        Array.from({ length: 7 }, (_, i) => {
          const x = bottomTier.cx - bottomTier.w / 2 + 18 + i * ((bottomTier.w - 36) / 6);
          const y = bottomTier.top + bottomTier.h - 20;
          return (
            <g key={i}>
              {Array.from({ length: 5 }, (_, p) => {
                const a = (p / 5) * Math.PI * 2;
                return (
                  <circle
                    key={p}
                    cx={x + Math.cos(a) * 6}
                    cy={y + Math.sin(a) * 5}
                    r="5.5"
                    fill={frostingLight}
                  />
                );
              })}
              <circle cx={x} cy={y} r="4" fill={frosting} />
            </g>
          );
        })}

      {/* Sugar pearls strung along every tier shoulder */}
      {has("pearls") &&
        tiers.flatMap((tier, ti) => {
          const rx = tier.w / 2;
          const count = Math.round(tier.w / 15);
          return Array.from({ length: count }, (_, i) => (
            <circle
              key={`${ti}-${i}`}
              cx={tier.cx - rx + 8 + i * ((tier.w - 16) / Math.max(1, count - 1))}
              cy={tier.top + tier.h - 8}
              r="3.4"
              fill="#FFFDF6"
              stroke="#E4D3B0"
              strokeWidth="0.8"
            />
          ));
        })}

      {/* Crown garnishes on the top surface */}
      {has("spheres") &&
        crownSpots(topTier, 5).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y - 8} r="9" fill={drip} />
            <circle cx={x - 3} cy={y - 11} r="3" fill="#FFFFFF" opacity="0.25" />
          </g>
        ))}

      {has("berries") &&
        crownSpots(topTier, 7).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y - 14} r="7.5" fill="#C4123A" />
            <circle cx={x - 2.5} cy={y - 16.5} r="2.4" fill="#FF6B8A" opacity="0.6" />
            <path
              d={`M ${x - 5} ${y - 20} L ${x} ${y - 24} L ${x + 5} ${y - 20} Z`}
              fill="#2F7D32"
            />
          </g>
        ))}

      {has("gold") &&
        crownSpots(topTier, 9).map(([x, y], i) => (
          <g key={i} transform={`rotate(${i * 40} ${x} ${y - 22})`}>
            <path
              d={`M ${x - 6} ${y - 26} l 12 4 l -4 11 l -12 -3 z`}
              fill="#E8B54A"
              stroke="#B98A26"
              strokeWidth="0.8"
            />
            <path d={`M ${x - 4} ${y - 24} l 7 2 l -2 5 z`} fill="#FBE08A" opacity="0.85" />
          </g>
        ))}

      {/* Candles */}
      {(has("candles") || candles > 0) &&
        crownSpots(topTier, Math.max(3, candles || 5)).map(([x, y], i) => (
          <g key={i}>
            <rect
              x={x - 3}
              y={y - 52}
              width="6"
              height="34"
              rx="3"
              fill={i % 2 === 0 ? "#F6D3D0" : "#FFF6E8"}
            />
            <path
              d={`M ${x} ${y - 66} q 5 7 0 13 q -5 -6 0 -13 z`}
              fill="#FFB347"
              className="origin-center animate-pulse"
            />
          </g>
        ))}

      {/* Inscription plaque on the front of the bottom tier */}
      <g>
        <rect
          x={isSlab ? 96 : 116}
          y={bottomTier.top + bottomTier.h / 2 - 2}
          width={isSlab ? 208 : 168}
          height="44"
          rx="10"
          fill="#FFFBF2"
          stroke="#E4D3B0"
          strokeWidth="2"
        />
        <text
          x="200"
          y={bottomTier.top + bottomTier.h / 2 + 26}
          textAnchor="middle"
          className="font-script"
          style={{ fontSize: message.length > 18 ? 17 : 21, fill: "#5A3620" }}
        >
          {message.trim() || "Your message here"}
        </text>
      </g>
    </svg>
  );
}
