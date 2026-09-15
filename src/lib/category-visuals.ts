import {
  Cake,
  Coffee,
  Cookie,
  Croissant,
  Flame,
  PieChart,
  Store,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/**
 * One place deciding how a category looks.
 *
 * The shop rail, the homepage explorer and the quick-view panel all label the
 * same seven categories; when each kept its own switch statement they drifted —
 * cookies were a cookie in one place and a generic storefront in another.
 */
export interface CategoryVisual {
  icon: LucideIcon;
  /** Short, concrete answer to "what is this and who is it for?". */
  blurb: string;
  /** Gradient used behind the icon tile. Tailwind classes. */
  tint: string;
}

const VISUALS: Record<string, CategoryVisual> = {
  brownies: {
    icon: Flame,
    blurb: "Dense, fudgy squares with a crackly top. Best eaten warm.",
    tint: "from-amber-500/25 to-amber-900/10",
  },
  cheesecakes: {
    icon: PieChart,
    blurb: "Baked cream-cheese slices and whole tins. Rich but never heavy.",
    tint: "from-rose-400/25 to-rose-800/10",
  },
  cakes: {
    icon: Cake,
    blurb: "Bento cakes for two up to tiered celebration bakes.",
    tint: "from-pink-400/25 to-fuchsia-800/10",
  },
  "tea-cakes": {
    icon: Coffee,
    blurb: "Loaf-style everyday cakes that keep for a few days.",
    tint: "from-orange-400/25 to-amber-800/10",
  },
  pastries: {
    icon: Croissant,
    blurb: "Laminated butter croissants, danishes and cruffins.",
    tint: "from-yellow-400/25 to-amber-700/10",
  },
  breads: {
    icon: Wheat,
    blurb: "Slow-fermented sourdough and soft sandwich loaves.",
    tint: "from-amber-600/25 to-stone-700/10",
  },
  cookies: {
    icon: Cookie,
    blurb: "Crisp at the edge, chewy in the middle. Sold by the box.",
    tint: "from-amber-400/25 to-orange-800/10",
  },
};

const FALLBACK: CategoryVisual = {
  icon: Store,
  blurb: "Fresh from the counter, baked the morning of your slot.",
  tint: "from-berry/20 to-cocoa/10",
};

export function categoryVisual(slug: string | null | undefined): CategoryVisual {
  return (slug && VISUALS[slug]) || FALLBACK;
}

export function categoryIcon(slug: string | null | undefined): LucideIcon {
  return categoryVisual(slug).icon;
}
