import { createServerFn } from "@tanstack/react-start";
import { subscribeSchema } from "./admin.schema";
import { z } from "zod";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { consume } = await import("./rate-limit.server");
    consume("newsletter");
    const { addSubscriber } = await import("./newsletter.server");
    return addSubscriber(data);
  });

/**
 * Unsubscribes an address.
 *
 * A valid `token` (from the signed link in the email footer) unsubscribes
 * immediately. Without one — someone typing their address on the page — a
 * confirmation link is emailed instead, since there is otherwise no way to
 * prove the caller controls the address.
 */
export const unsubscribeFromNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email(),
        token: z.string().trim().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { consume } = await import("./rate-limit.server");
    consume("newsletter");
    const { removeSubscriber } = await import("./newsletter.server");
    return removeSubscriber(data.email, data.token);
  });
