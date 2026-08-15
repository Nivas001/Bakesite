import { createServerFn } from "@tanstack/react-start";
import { subscribeSchema } from "./admin.schema";
import { z } from "zod";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { addSubscriber } = await import("./newsletter.server");
    return addSubscriber(data);
  });

export const unsubscribeFromNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().email() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { removeSubscriber } = await import("./newsletter.server");
    return removeSubscriber(data.email);
  });