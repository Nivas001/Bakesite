import { useState, useEffect } from "react";

export interface SectionContent {
  badge: string;
  title: string;
  description: string;
}

export interface SiteContent {
  // Homepage sections
  home_lab: SectionContent;
  home_faq: SectionContent;
  home_cta: SectionContent;

  // About page sections
  about_3d: SectionContent;
  about_delivery: SectionContent;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home_lab: {
    badge: "Pure Craft & Cold Fermentation",
    title: "The artisan bakery laboratory",
    description:
      "No shortcuts, zero chemical improvers. Just wild fermentation, stone-ground flour, and real French butter.",
  },
  home_faq: {
    badge: "Clear Answers",
    title: "Frequently asked questions",
    description:
      "Everything you need to know about freshness, morning slots, and delivery.",
  },
  home_cta: {
    badge: "Fresh Mornings",
    title: "Tomorrow morning could smell a lot better.",
    description:
      "Reserve your next-day slot now. We mix and bake fresh at dawn for your chosen arrival window.",
  },
  about_3d: {
    badge: "Interactive 3D Cake Atelier",
    title: "Interactive 3D Cake Atelier",
    description:
      "Explore our signature wellness bakes in full 3D with interactive ingredient breakdown and crumb texture inspection.",
  },
  about_delivery: {
    badge: "Safe & Damage-Proof Courier Shield",
    title: "How we deliver your bakes 100% safe & intact",
    description:
      "Delicate croissants, moist multi-layer cakes, and artisanal brownie slabs require precision engineering to travel from our dawn hearth to your celebration table.",
  },
};

const STORAGE_KEY = "anibakes_site_content_v1";
const SYNC_EVENT = "anibakes_site_content_updated";

export function getStoredSiteContent(): SiteContent {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_CONTENT;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(raw);
    return {
      home_lab: { ...DEFAULT_SITE_CONTENT.home_lab, ...(parsed.home_lab || {}) },
      home_faq: { ...DEFAULT_SITE_CONTENT.home_faq, ...(parsed.home_faq || {}) },
      home_cta: { ...DEFAULT_SITE_CONTENT.home_cta, ...(parsed.home_cta || {}) },
      about_3d: { ...DEFAULT_SITE_CONTENT.about_3d, ...(parsed.about_3d || {}) },
      about_delivery: { ...DEFAULT_SITE_CONTENT.about_delivery, ...(parsed.about_delivery || {}) },
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveStoredSiteContent(content: SiteContent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: content }));
  } catch (err) {
    console.error("Failed to save site content to localStorage:", err);
  }
}

export function resetStoredSiteContent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: DEFAULT_SITE_CONTENT }));
  } catch (err) {
    console.error("Failed to reset site content:", err);
  }
}

export function useSiteContent(): {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  resetContent: () => void;
} {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    // Initial load from localStorage on client mount
    setContent(getStoredSiteContent());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContent>;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      } else {
        setContent(getStoredSiteContent());
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent);
    saveStoredSiteContent(newContent);
  };

  const resetContent = () => {
    setContent(DEFAULT_SITE_CONTENT);
    resetStoredSiteContent();
  };

  return { content, updateContent, resetContent };
}
