import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import type { SiteContent } from "./site-content";

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchSiteContentServer } = await import("./site-content.server");
  return fetchSiteContentServer();
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => input as SiteContent)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { saveSiteContentServer } = await import("./site-content.server");
    await assertAdmin(context.userId);
    return saveSiteContentServer(data);
  });

export const resetSiteContent = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { resetSiteContentServer } = await import("./site-content.server");
    await assertAdmin(context.userId);
    return resetSiteContentServer();
  });
