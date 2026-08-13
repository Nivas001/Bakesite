import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import {
  blackoutSchema,
  campaignSchema,
  orderStatusSchema,
  productSchema,
} from "./admin.schema";

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, fetchAdminOrders, fetchAdminProducts, fetchBlackouts, fetchStats } =
      await import("./admin.server");
    const { fetchCampaigns, fetchSubscribers } = await import("./newsletter.server");
    await assertAdmin(context.userId);
    const [orders, catalog, blackouts, stats, subscribers, campaigns] = await Promise.all([
      fetchAdminOrders(),
      fetchAdminProducts(),
      fetchBlackouts(),
      fetchStats(),
      fetchSubscribers(),
      fetchCampaigns(),
    ]);
    return { orders, ...catalog, blackouts, stats, subscribers, campaigns };
  });

export const sendNewsletter = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => campaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { sendCampaign } = await import("./newsletter.server");
    await assertAdmin(context.userId);
    return sendCampaign(context.userId, data);
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => orderStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, changeOrderStatus } = await import("./admin.server");
    await assertAdmin(context.userId);
    return changeOrderStatus(data);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, upsertProduct } = await import("./admin.server");
    await assertAdmin(context.userId);
    return upsertProduct(data);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((id: string) => id)
  .handler(async ({ data, context }) => {
    const { assertAdmin, removeProduct } = await import("./admin.server");
    await assertAdmin(context.userId);
    return removeProduct(data);
  });

export const createBlackout = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => blackoutSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, addBlackout } = await import("./admin.server");
    await assertAdmin(context.userId);
    return addBlackout(data);
  });

export const deleteBlackout = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((id: string) => id)
  .handler(async ({ data, context }) => {
    const { assertAdmin, removeBlackout } = await import("./admin.server");
    await assertAdmin(context.userId);
    return removeBlackout(data);
  });