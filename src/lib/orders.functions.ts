import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import {
  placeOrderSchema,
  profileSchema,
  cancelRescheduledOrderSchema,
  reportOrderIssueSchema,
} from "./orders.schema";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { getProfile } = await import("./orders.server");
    return getProfile(context.userId);
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveProfile } = await import("./orders.server");
    return saveProfile(context.userId, data);
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((input: unknown) => placeOrderSchema.parse(input))
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

export const cancelRescheduledOrder = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((input: unknown) => cancelRescheduledOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { cancelRescheduledOrderForUser } = await import("./orders.server");
    return cancelRescheduledOrderForUser(context.userId, data);
  });

export const reportOrderIssue = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((input: unknown) => reportOrderIssueSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { reportOrderIssueForUser } = await import("./orders.server");
    return reportOrderIssueForUser(context.userId, data);
  });