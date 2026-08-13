import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import { placeOrderSchema, profileSchema } from "./orders.schema";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { getProfile } = await import("./orders.server");
    return getProfile(context.userId);
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveProfile } = await import("./orders.server");
    return saveProfile(context.userId, data);
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { createOrderForUser } = await import("./orders.server");
    return createOrderForUser(context.userId, data);
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { listOrdersForUser } = await import("./orders.server");
    return listOrdersForUser(context.userId);
  });