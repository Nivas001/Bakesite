import fs from "node:fs";
import path from "node:path";
import type { SiteContent } from "./site-content";
import { DEFAULT_SITE_CONTENT } from "./site-content";
import type { CustomerMoment } from "./customer-moments";
import { DEFAULT_MOMENTS } from "./customer-moments";
import type { ProductWeightVariant } from "./pricing";

export interface CategoryLayoutConfig {
  sort_order: number;
  layout_rows?: number;
}

export interface ProductWeightConfig {
  item_type?: "weight" | "unit" | "pack" | null;
  unit_weight_grams?: number | null;
  serving_yield?: string | null;
  weight_variants?: ProductWeightVariant[] | null;
  images?: string[] | null;
}

export interface AppStateStorage {
  category_layout: Record<string, CategoryLayoutConfig>;
  product_sequence: Record<string, number>;
  product_weights: Record<string, ProductWeightConfig>;
  site_content: SiteContent;
  customer_moments: CustomerMoment[];
  updated_at?: string | undefined;
}

const DEFAULT_STATE: AppStateStorage = {
  category_layout: {},
  product_sequence: {},
  product_weights: {},
  site_content: DEFAULT_SITE_CONTENT,
  customer_moments: DEFAULT_MOMENTS,
};

let inMemoryState: AppStateStorage = { ...DEFAULT_STATE };
let isInitialized = false;

function getStoreFilePath(): string {
  const cwd = process.cwd();
  const dataDir = path.join(cwd, "data");
  return path.join(dataDir, "app-state.json");
}

function ensureDataDir(): string {
  const cwd = process.cwd();
  const dataDir = path.join(cwd, "data");
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("[server-storage] Failed to create data directory:", err);
  }
  return dataDir;
}

export function loadAppState(): AppStateStorage {
  if (isInitialized && inMemoryState) {
    return inMemoryState;
  }

  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw) as Partial<AppStateStorage>;
        inMemoryState = {
          category_layout: parsed.category_layout ?? {},
          product_sequence: parsed.product_sequence ?? {},
          product_weights: parsed.product_weights ?? {},
          site_content: parsed.site_content
            ? {
                home_lab: { ...DEFAULT_SITE_CONTENT.home_lab, ...(parsed.site_content.home_lab || {}) },
                home_faq: { ...DEFAULT_SITE_CONTENT.home_faq, ...(parsed.site_content.home_faq || {}) },
                home_cta: { ...DEFAULT_SITE_CONTENT.home_cta, ...(parsed.site_content.home_cta || {}) },
                about_3d: { ...DEFAULT_SITE_CONTENT.about_3d, ...(parsed.site_content.about_3d || {}) },
                about_delivery: { ...DEFAULT_SITE_CONTENT.about_delivery, ...(parsed.site_content.about_delivery || {}) },
              }
            : DEFAULT_SITE_CONTENT,
          customer_moments: Array.isArray(parsed.customer_moments) && parsed.customer_moments.length > 0
            ? parsed.customer_moments
            : DEFAULT_MOMENTS,
          ...(parsed.updated_at ? { updated_at: parsed.updated_at } : {}),
        };
        isInitialized = true;
        return inMemoryState;
      }
    }
  } catch (err) {
    console.warn("[server-storage] Failed to read app-state.json, using defaults:", err);
  }

  inMemoryState = { ...DEFAULT_STATE };
  isInitialized = true;
  return inMemoryState;
}

export function saveAppState(partial: Partial<AppStateStorage>): AppStateStorage {
  const current = loadAppState();
  inMemoryState = {
    ...current,
    ...partial,
    updated_at: new Date().toISOString(),
  };

  try {
    ensureDataDir();
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(inMemoryState, null, 2), "utf-8");
  } catch (err) {
    console.warn("[server-storage] Failed to write app-state.json to disk:", err);
  }

  return inMemoryState;
}

// Category layout helpers
export function getCategoryLayoutOverrides(): Record<string, CategoryLayoutConfig> {
  return loadAppState().category_layout;
}

export function saveCategoryLayoutOverrides(
  updates: Array<{ id: string; sort_order: number; layout_rows?: number; slug?: string }>,
) {
  const state = loadAppState();
  const current = { ...state.category_layout };

  for (const item of updates) {
    const existing = current[item.id] ?? (item.slug ? current[item.slug] : undefined) ?? { sort_order: item.sort_order };
    const config: CategoryLayoutConfig = {
      sort_order: item.sort_order,
      layout_rows: item.layout_rows ?? existing.layout_rows ?? 1,
    };
    current[item.id] = config;
    if (item.slug) {
      current[item.slug] = config;
      current[`cat_${item.slug}`] = config;
    }
  }

  saveAppState({ category_layout: current });
}

// Product sequence helpers
export function getProductSequenceOverrides(): Record<string, number> {
  return loadAppState().product_sequence;
}

export function saveProductSequenceOverrides(
  updates: Array<{ id: string; sort_order: number; slug?: string }>,
) {
  const state = loadAppState();
  const current = { ...state.product_sequence };

  for (const item of updates) {
    current[item.id] = item.sort_order;
    if (item.slug) {
      current[item.slug] = item.sort_order;
      current[`prod_${item.slug.replace(/-/g, "_")}`] = item.sort_order;
    }
  }

  saveAppState({ product_sequence: current });
}

// Product weight / custom config helpers
export function getProductWeightOverrides(): Record<string, ProductWeightConfig> {
  return loadAppState().product_weights;
}

export function saveProductWeightOverrides(
  productId: string,
  config: ProductWeightConfig,
  slug?: string,
) {
  const state = loadAppState();
  const current = { ...state.product_weights };
  current[productId] = config;
  if (slug) {
    current[slug] = config;
  }
  saveAppState({ product_weights: current });
}

// Site content helpers
export function getSiteContentFromStorage(): SiteContent {
  return loadAppState().site_content;
}

export function saveSiteContentToStorage(content: SiteContent): SiteContent {
  saveAppState({ site_content: content });
  return content;
}

export function resetSiteContentInStorage(): SiteContent {
  saveAppState({ site_content: DEFAULT_SITE_CONTENT });
  return DEFAULT_SITE_CONTENT;
}

// Customer moments helpers
export function getCustomerMomentsFromStorage(): CustomerMoment[] {
  return loadAppState().customer_moments;
}

export function saveCustomerMomentsToStorage(moments: CustomerMoment[]): CustomerMoment[] {
  saveAppState({ customer_moments: moments });
  return moments;
}

export function resetCustomerMomentsInStorage(): CustomerMoment[] {
  saveAppState({ customer_moments: DEFAULT_MOMENTS });
  return DEFAULT_MOMENTS;
}
