import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import {
  blackoutSchema,
  campaignSchema,
  orderStatusSchema,
  rescheduleOrderSchema,
  productSchema,
} from "./admin.schema";

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, fetchAdminOrders, fetchAdminProducts, fetchBlackouts, fetchStats, fetchAdminUsers } =
      await import("./admin.server");
    const { fetchCampaigns, fetchSubscribers } = await import("./newsletter.server");
    await assertAdmin(context.userId);
    const [orders, catalog, blackouts, stats, subscribers, campaigns, users] = await Promise.all([
      fetchAdminOrders(),
      fetchAdminProducts(),
      fetchBlackouts(),
      fetchStats(),
      fetchSubscribers(),
      fetchCampaigns(),
      fetchAdminUsers(),
    ]);
    return { orders, ...catalog, blackouts, stats, subscribers, campaigns, users };
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

export const rescheduleOrderAdmin = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => rescheduleOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, rescheduleOrder } = await import("./admin.server");
    await assertAdmin(context.userId);
    return rescheduleOrder(data);
  });

import { z } from "zod";

const uploadProductImageSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  base64: z.string().min(1),
  mimeType: z.string().min(1).max(100),
});

export const uploadProductImageAdmin = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => uploadProductImageSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { uploadProductImage } = await import("@/integrations/appwrite/admin.server");
    await assertAdmin(context.userId);
    const imageUrl = await uploadProductImage(data);
    return { imageUrl };
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

export const saveCategoryOrder = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => {
    const { categoryOrderSchema } = require("./admin.schema");
    return categoryOrderSchema.parse(input);
  })
  .handler(async ({ data, context }) => {
    const { assertAdmin, saveCategoryOrderingAdmin } = await import("./admin.server");
    await assertAdmin(context.userId);
    return saveCategoryOrderingAdmin(data);
  });

export const saveProductSequence = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => {
    const { productSequenceSchema } = require("./admin.schema");
    return productSequenceSchema.parse(input);
  })
  .handler(async ({ data, context }) => {
    const { assertAdmin, saveProductSequenceAdmin } = await import("./admin.server");
    await assertAdmin(context.userId);
    return saveProductSequenceAdmin(data);
  });