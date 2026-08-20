import type { SiteContent } from "./site-content";
import { DEFAULT_SITE_CONTENT } from "./site-content";
import {
  getSiteContentFromStorage,
  saveSiteContentToStorage,
  resetSiteContentInStorage,
} from "./server-storage.server";

export async function fetchSiteContentServer(): Promise<SiteContent> {
  try {
    return getSiteContentFromStorage();
  } catch (err) {
    console.warn("[site-content.server] Error loading site content, using defaults:", err);
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContentServer(content: SiteContent): Promise<SiteContent> {
  try {
    return saveSiteContentToStorage(content);
  } catch (err) {
    console.error("[site-content.server] Error saving site content:", err);
    throw new Error("Failed to save site content to server storage.");
  }
}

export async function resetSiteContentServer(): Promise<SiteContent> {
  try {
    return resetSiteContentInStorage();
  } catch (err) {
    console.error("[site-content.server] Error resetting site content:", err);
    throw new Error("Failed to reset site content.");
  }
}
