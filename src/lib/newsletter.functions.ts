import { createServerFn } from "@tanstack/react-start";
import { subscribeSchema } from "./admin.schema";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { addSubscriber } = await import("./newsletter.server");
    return addSubscriber(data);
  });