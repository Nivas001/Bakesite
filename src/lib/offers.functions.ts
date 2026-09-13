import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import { claimGameCouponSchema, offerCodeSchema, validateOfferCodeSchema } from "./offers.schema";

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
  .validator((input: unknown) => offerCodeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./roles.server");
    const { upsertOfferCode } = await import("./offers.server");
    await assertAdmin(context.userId);
    return upsertOfferCode(data);
  });

export const deleteAdminOfferCode = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((id: string) => id)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./roles.server");
    const { removeOfferCode } = await import("./offers.server");
    await assertAdmin(context.userId);
    return removeOfferCode(data);
  });

export const checkOfferCode = createServerFn({ method: "POST" })
  .validator((input: unknown) => validateOfferCodeSchema.parse(input))
  .handler(async ({ data }) => {
    const { validatePromoCode } = await import("./offers.server");
    return validatePromoCode(data);
  });

/**
 * Issues an arcade voucher. Requires a signed-in account: this endpoint mints
 * live discount codes, so leaving it open let anyone script unlimited ones.
 */
export const claimGameRewardCoupon = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((input: unknown) => claimGameCouponSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { generateGameWinnerVoucher } = await import("./offers.server");
    return generateGameWinnerVoucher(context.userId, data);
  });
