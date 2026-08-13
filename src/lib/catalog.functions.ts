import { createServerFn } from "@tanstack/react-start";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { loadCatalog } = await import("./catalog.server");
  return loadCatalog();
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { loadProductBySlug } = await import("./catalog.server");
    return loadProductBySlug(slug);
  });

export const getBlackoutDates = createServerFn({ method: "GET" }).handler(async () => {
  const { loadBlackouts } = await import("./catalog.server");
  return loadBlackouts();
});