import { createServerFn } from "@tanstack/react-start";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import { reviewSchema } from "./admin.schema";

export const getProductReviews = createServerFn({ method: "GET" })
  .inputValidator((productId: string) => productId)
  .handler(async ({ data }) => {
    const { fetchProductReviews } = await import("./reviews.server");
    return fetchProductReviews(data);
  });

export const getMyReviewState = createServerFn({ method: "GET" })
  .middleware([requireAppwriteAuth])
  .inputValidator((productId: string) => productId)
  .handler(async ({ data, context }) => {
    const { fetchMyReviewState } = await import("./reviews.server");
    return fetchMyReviewState(context.userId, data);
  });

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveReview } = await import("./reviews.server");
    return saveReview(context.userId, data);
  });