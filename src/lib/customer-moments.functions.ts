import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import type { CustomerMoment } from "./customer-moments";
import {
  getCustomerMomentsFromStorage,
  saveCustomerMomentsToStorage,
  resetCustomerMomentsInStorage,
} from "./server-storage.server";

export const getCustomerMomentsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return getCustomerMomentsFromStorage();
  } catch (err) {
    console.warn("Failed to load customer moments from storage:", err);
    const { DEFAULT_MOMENTS } = await import("./customer-moments");
    return DEFAULT_MOMENTS;
  }
});

export const saveCustomerMomentsServerFn = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => input as CustomerMoment[])
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.userId);
    return saveCustomerMomentsToStorage(data);
  });

export const resetCustomerMomentsServerFn = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.userId);
    return resetCustomerMomentsInStorage();
  });
