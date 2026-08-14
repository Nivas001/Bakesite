import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import { offerCodeSchema, validateOfferCodeSchema } from "./offers.schema";

export const getAdminOfferCodes = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./roles.server");
    const { fetchOfferCodes } = await import("./offers.server");
    await assertAdmin(context.userId);
    return fetchOfferCodes();
  });

export const getPublicOfferCodes = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchActiveOfferCodes } = await import("./offers.server");
  return fetchActiveOfferCodes();
});

export const saveAdminOfferCode = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => offerCodeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./roles.server");
    const { upsertOfferCode } = await import("./offers.server");
    await assertAdmin(context.userId);
    return upsertOfferCode(data);
  });

export const deleteAdminOfferCode = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((id: string) => id)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./roles.server");
    const { removeOfferCode } = await import("./offers.server");
    await assertAdmin(context.userId);
    return removeOfferCode(data);
  });

export const checkOfferCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => validateOfferCodeSchema.parse(input))
  .handler(async ({ data }) => {
    const { validatePromoCode } = await import("./offers.server");
    return validatePromoCode(data);
  });
