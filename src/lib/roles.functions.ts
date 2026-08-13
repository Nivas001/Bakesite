import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { hasRole } = await import("./roles.server");
    return { userId: context.userId, isAdmin: await hasRole(context.userId, "admin") };
  });