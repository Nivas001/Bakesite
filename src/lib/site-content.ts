import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteContent, saveSiteContent, resetSiteContent } from "./site-content.functions";

export interface SectionContent {
  badge: string;
  title: string;
  description: string;
}

export interface GalleryPhoto {
  id: string;
  label: string;
  image: string;
  tag?: string | undefined;
  alt?: string | undefined;
}

export interface GallerySectionContent extends SectionContent {
  photos: GalleryPhoto[];
}

export interface SiteContent {
  // Homepage sections
  home_lab: SectionContent;
  home_faq: SectionContent;
  home_cta: SectionContent;

  // About page sections
  about_3d: SectionContent;
  about_delivery: SectionContent;
  about_gallery: GallerySectionContent;
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
  about_gallery: {
    badge: "Atelier & Hearth Portraits",
    title: "Portraits of our daily oven craft",
    description:
      "A peek behind the proofing racks. Slow lamination, 24K gold gilding, and the purest single-origin bakes straight from our dawn ovens.",
    photos: [
      {
        id: "shot-1",
        label: "Belgian Fudge Brownie",
        image: "/products/belgian-fudge-brownie-stack.jpg",
        tag: "Signature Stack",
      },
      {
        id: "shot-2",
        label: "Basque Strawberry Cheesecake",
        image: "/products/strawberry-cheesecake.jpg",
        tag: "Velvety Crumb",
      },
      {
        id: "shot-3",
        label: "Artisan Sourdough Loaf",
        image: "/products/artisan-sourdough.jpg",
        tag: "36h Ferment",
      },
      {
        id: "shot-4",
        label: "French Butter Croissant",
        image: "/products/artisan-croissant.jpg",
        tag: "27-Layer Flake",
      },
      {
        id: "shot-5",
        label: "Rosemilk Teatime Cake",
        image: "/products/rosemilk-tea-cake.jpg",
        tag: "Floral Spices",
      },
      {
        id: "shot-6",
        label: "Pistachio Custard Danish",
        image: "/products/pistachio-danish.jpg",
        tag: "Morning Pastry",
      },
      {
        id: "shot-7",
        label: "Salted Caramel Rosette",
        image: "/about/salted-caramel-cupcake.jpg",
        tag: "Couverture Cream",
      },
      {
        id: "shot-8",
        label: "Royal Gilded Brownie",
        image: "/cakes/royal-gold-brownie.jpg",
        tag: "24K Gold Leaf",
      },
      {
        id: "shot-9",
        label: "Dark Belgian Truffle Cake",
        image: "/cakes/belgian-truffle-cake.jpg",
        tag: "Celebration Tier",
      },
      {
        id: "shot-10",
        label: "Biscoff Herringbone Cake",
        image: "/cakes/biscoff-herringbone-cake.jpg",
        tag: "Speculoos Butter",
      },
      {
        id: "shot-11",
        label: "Pink Bento Cake",
        image: "/cakes/pink-bento-cake.jpg",
        tag: "Mini Bento",
      },
      {
        id: "shot-12",
        label: "Matcha Sea Salt Cookies",
        image: "/products/matcha-cookies.jpg",
        tag: "Uji Matcha",
      },
    ],
  },
};

const STORAGE_KEY = "anibakes_site_content_v2";
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
      about_gallery: {
        ...DEFAULT_SITE_CONTENT.about_gallery,
        ...(parsed.about_gallery || {}),
        photos:
          parsed.about_gallery?.photos && Array.isArray(parsed.about_gallery.photos) && parsed.about_gallery.photos.length > 0
            ? parsed.about_gallery.photos
            : DEFAULT_SITE_CONTENT.about_gallery.photos,
      },
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
  updateContent: (newContent: SiteContent) => Promise<void>;
  resetContent: () => Promise<void>;
  isLoading: boolean;
} {
  const queryClient = useQueryClient();
  const fetchFn = useServerFn(getSiteContent);
  const saveFn = useServerFn(saveSiteContent);
  const resetFn = useServerFn(resetSiteContent);

  const { data: serverContent, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      try {
        const res = await fetchFn();
        if (res) {
          saveStoredSiteContent(res as SiteContent);
          return res as SiteContent;
        }
      } catch (err) {
        console.warn("Falling back to local site content:", err);
      }
      return getStoredSiteContent();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  const [localContent, setLocalContent] = useState<SiteContent>(() => {
    return getStoredSiteContent();
  });

  useEffect(() => {
    if (serverContent) {
      setLocalContent(serverContent);
    }
  }, [serverContent]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContent>;
      if (customEvent.detail) {
        setLocalContent(customEvent.detail);
      } else {
        setLocalContent(getStoredSiteContent());
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const activeContent: SiteContent = serverContent || localContent || DEFAULT_SITE_CONTENT;

  const updateContent = async (newContent: SiteContent) => {
    setLocalContent(newContent);
    saveStoredSiteContent(newContent);
    try {
      await saveFn({ data: newContent });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
    } catch (err) {
      console.warn("Failed to persist site content to server:", err);
    }
  };

  const resetContent = async () => {
    setLocalContent(DEFAULT_SITE_CONTENT);
    resetStoredSiteContent();
    try {
      await resetFn();
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
    } catch (err) {
      console.warn("Failed to reset site content on server:", err);
    }
  };

  return { content: activeContent, updateContent, resetContent, isLoading };
}
