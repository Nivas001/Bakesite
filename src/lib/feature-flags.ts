/**
 * Feature Flags — Ani Bakes Bakery
 *
 * All UI enhancement flags stored in localStorage.
 * Flags can be toggled from the Admin Dev Panel.
 * All flags are ON by default.
 */

import { useCallback, useEffect, useState } from "react";

export type FlagKey =
  | "ff_custom_bakery_fonts"
  | "ff_scroll_reveal"
  | "ff_floating_particles"
  | "ff_stats_ticker"
  | "ff_typewriter"
  | "ff_card_glow"
  | "ff_card_ribbon"
  | "ff_shop_search"
  | "ff_shop_stagger"
  | "ff_product_trust_badges"
  | "ff_product_sticky_bar"
  | "ff_product_how_it_works"
  | "ff_offers_shimmer"
  | "ff_offers_confetti"
  | "ff_footer_instagram"
  | "ff_scroll_to_top";

export type FlagCategory = "Typography" | "Animations" | "Home Page" | "Shop Page" | "Product Page" | "Offers Page" | "Footer";

export type FlagDefinition = {
  label: string;
  description: string;
  category: FlagCategory;
  emoji: string;
  defaultValue: boolean;
};

export const FEATURE_FLAGS: Record<FlagKey, FlagDefinition> = {
  ff_custom_bakery_fonts: {
    label: "Artisan Display Typography (TAN NIMBUS)",
    description:
      "Uses the bespoke curvy TAN NIMBUS display font for all bakery headings, counter titles, and marquee banners. When toggled OFF, reverts cleanly to standard Playfair Display & Inter.",
    category: "Typography",
    emoji: "🥖",
    defaultValue: true,
  },
  ff_scroll_reveal: {
    label: "Scroll-Reveal Animations",
    description:
      "Every section and card smoothly fades and slides up from below as the user scrolls down the page. Makes the site feel polished and alive — like each section is greeting you as you arrive.",
    category: "Animations",
    emoji: "🎬",
    defaultValue: true,
  },
  ff_floating_particles: {
    label: "Floating Bakery Particles",
    description:
      "Tiny bakery emojis (🥐 🍪 🎂 ✨) float slowly upward and fade behind the hero banner on the home page. A subtle, playful touch that sets the artisan bakery mood on first arrival.",
    category: "Home Page",
    emoji: "✨",
    defaultValue: true,
  },
  ff_stats_ticker: {
    label: "Stats Ticker Marquee",
    description:
      "A continuously scrolling ribbon between the hero and featured products showing social proof like '1,200+ bakes delivered · 4.9★ rated · Baked fresh every morning'. Builds trust at a glance.",
    category: "Home Page",
    emoji: "📊",
    defaultValue: true,
  },
  ff_typewriter: {
    label: "Hero Typewriter Effect",
    description:
      "The subtitle below 'Ani Bakes' types out words one by one — cycling through 'fresh croissants', 'celebration cakes', 'artisan sourdoughs'. Adds life and keeps visitors reading a moment longer.",
    category: "Home Page",
    emoji: "⌨️",
    defaultValue: true,
  },
  ff_card_glow: {
    label: "Product Card Image Glow",
    description:
      "When hovering over a product card, a warm berry-tinted glow ring appears around the product image. Draws attention to the item being considered and reinforces the premium feel.",
    category: "Shop Page",
    emoji: "💫",
    defaultValue: true,
  },
  ff_card_ribbon: {
    label: "Fresh Baked Ribbon Badge",
    description:
      "A small diagonal 'Fresh' ribbon appears on the top-left corner of product images to highlight items baked the same morning. Visually signals freshness without cluttering the card.",
    category: "Shop Page",
    emoji: "🎀",
    defaultValue: true,
  },
  ff_shop_search: {
    label: "Shop Live Search",
    description:
      "A search input at the top of the shop grid lets customers instantly filter products by name as they type — no page reload needed. Great for customers who know exactly what they want.",
    category: "Shop Page",
    emoji: "🔍",
    defaultValue: true,
  },
  ff_shop_stagger: {
    label: "Shop Grid Stagger Animation",
    description:
      "When you switch category filters on the shop page, the product cards animate in one-by-one with a cascading delay instead of all appearing at once. Makes browsing feel smooth and intentional.",
    category: "Shop Page",
    emoji: "🃏",
    defaultValue: true,
  },
  ff_product_trust_badges: {
    label: "Product Trust Badges",
    description:
      "A row of small pill badges below the product price — '🌿 No Preservatives · 🔥 Baked Same Day · 🌾 Fresh Flour · 📦 Eco Packaging'. Reassures customers about quality before they add to cart.",
    category: "Product Page",
    emoji: "🏅",
    defaultValue: true,
  },
  ff_product_sticky_bar: {
    label: "Sticky Mobile Add to Cart Bar",
    description:
      "On mobile devices, a fixed bar at the bottom of the screen shows the product name, price, and an 'Add to Cart' button — so customers can add without scrolling back up to the top.",
    category: "Product Page",
    emoji: "📌",
    defaultValue: true,
  },
  ff_product_how_it_works: {
    label: "How It Gets to You Timeline",
    description:
      "A compact 3-step horizontal flow below the product description: 'Choose a slot → Baker prepares fresh → Delivered or Pickup'. Educates first-time customers on the unique slot-based ordering process.",
    category: "Product Page",
    emoji: "📋",
    defaultValue: true,
  },
  ff_offers_shimmer: {
    label: "Coupon Card Shimmer Effect",
    description:
      "A light shimmer sweep glides across each coupon ticket card on hover — like a gold sheen over a gift card. Makes the vouchers feel premium and interactive.",
    category: "Offers Page",
    emoji: "🌟",
    defaultValue: true,
  },
  ff_offers_confetti: {
    label: "Copy Code Confetti Burst",
    description:
      "When a coupon code is copied, colourful confetti dots burst outward from the copy button for half a second. A tiny moment of delight that rewards the user's action.",
    category: "Offers Page",
    emoji: "🎉",
    defaultValue: true,
  },
  ff_footer_instagram: {
    label: "Instagram & Social Links",
    description:
      "Displays the bakery's Instagram (and WhatsApp when added) link icons in the footer. Helps customers follow along for daily bake updates, stories, and seasonal specials.",
    category: "Footer",
    emoji: "📸",
    defaultValue: true,
  },
  ff_scroll_to_top: {
    label: "Scroll to Top Button",
    description:
      "A small floating pill button appears in the bottom-right corner after the user has scrolled 400px down. Clicking it smoothly scrolls back to the top of the page — handy on long pages.",
    category: "Footer",
    emoji: "⬆️",
    defaultValue: true,
  },
};

const STORAGE_PREFIX = "anibakes_ff_";

function getStoredValue(key: FlagKey): boolean {
  if (typeof window === "undefined") return FEATURE_FLAGS[key].defaultValue;
  const stored = localStorage.getItem(STORAGE_PREFIX + key);
  if (stored === null) return FEATURE_FLAGS[key].defaultValue;
  return stored === "true";
}

/** Returns all flags as a Record<FlagKey, boolean> */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>(() => {
    const result = {} as Record<FlagKey, boolean>;
    for (const key of Object.keys(FEATURE_FLAGS) as FlagKey[]) {
      result[key] = getStoredValue(key);
    }
    return result;
  });

  const toggle = useCallback((key: FlagKey) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_PREFIX + key, String(next[key]));
      }
      return next;
    });
  }, []);

  const setFlag = useCallback((key: FlagKey, value: boolean) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_PREFIX + key, String(value));
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const result = {} as Record<FlagKey, boolean>;
    for (const key of Object.keys(FEATURE_FLAGS) as FlagKey[]) {
      result[key] = FEATURE_FLAGS[key].defaultValue;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_PREFIX + key);
      }
    }
    setFlags(result);
  }, []);

  return { flags, toggle, setFlag, resetAll };
}

/** Convenience hook for consuming a single flag value */
export function useFlag(key: FlagKey): boolean {
  const [value, setValue] = useState<boolean>(() => getStoredValue(key));

  useEffect(() => {
    // Re-read on mount (handles SSR mismatch)
    setValue(getStoredValue(key));
  }, [key]);

  return value;
}

/** Social links stored in localStorage, editable from Admin */
const SOCIAL_LS_KEY = "anibakes_social_links";

export type SocialLinks = {
  instagram: string;
  whatsapp: string;
  email: string;
  facebook: string;
  x: string;
};

const DEFAULT_SOCIAL: SocialLinks = {
  instagram: "https://www.instagram.com/aniiibakes_.__",
  whatsapp: "",
  email: "orders@anibakes.app",
  facebook: "",
  x: "",
};

export function getSocialLinks(): SocialLinks {
  if (typeof window === "undefined") return DEFAULT_SOCIAL;
  try {
    const stored = localStorage.getItem(SOCIAL_LS_KEY);
    if (stored) return { ...DEFAULT_SOCIAL, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SOCIAL;
}

export function saveSocialLinks(links: SocialLinks): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SOCIAL_LS_KEY, JSON.stringify(links));
  }
}

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLinks>(DEFAULT_SOCIAL);

  useEffect(() => {
    setLinks(getSocialLinks());
  }, []);

  const save = useCallback((updated: SocialLinks) => {
    saveSocialLinks(updated);
    setLinks(updated);
  }, []);

  return { links, save };
}
