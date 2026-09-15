import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Sunrise } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import {
  customerDescription,
  discountLabel,
  finalPrice,
  formatCurrency,
  hasDiscount,
  type CatalogProduct,
} from "@/lib/pricing";

/**
 * Everything a shopper needs to decide, without leaving the grid.
 *
 * Browsing used to mean a full page navigation per bake and a back button to
 * return to your place in the list — which is where most people gave up on
 * comparing two cakes. This keeps the list behind the dialog.
 */
export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: {
  product: CatalogProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { add } = useCart();
  const variants = product.weight_variants ?? [];
  const hasVariants = variants.length > 0;

  const gallery = useMemo(() => {
    const list = [product.image_url, ...(product.images ?? [])].filter((url): url is string =>
      Boolean(url),
    );
    return Array.from(new Set(list));
  }, [product.image_url, product.images]);

  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // A dialog reused for the next card must not inherit the last one's state.
  useEffect(() => {
    if (!open) return;
    setVariantId(variants[0]?.id ?? null);
    setQuantity(1);
    setActiveImage(0);
  }, [open, product.id]);

  const variant = hasVariants ? (variants.find((v) => v.id === variantId) ?? variants[0]!) : null;
  const basePrice = variant ? variant.price : product.price;
  const price = finalPrice(basePrice, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);
  const description = customerDescription(product.description);
  const cover = gallery[activeImage] ?? gallery[0] ?? "/products/croissant.jpg";

  function handleAdd() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: price,
        basePrice,
        imageUrl: product.image_url,
        variantLabel: variant ? variant.label : null,
        variantWeightGrams: variant ? variant.weight_grams : null,
      },
      quantity,
    );
    toast.success(
      `${quantity} × ${product.name}${variant ? ` (${variant.label})` : ""} added to cart`,
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto rounded-3xl border-border/80 bg-card p-0 shadow-lift">
        <div className="grid sm:grid-cols-2">
          {/* Gallery */}
          <div className="relative bg-secondary/40 p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-2xl border border-border/60">
              <img src={cover} alt={product.name} className="aspect-square w-full object-cover" />
              {discounted && (
                <span className="absolute top-2.5 left-2.5 rounded-full bg-berry px-2.5 py-1 text-[11px] font-bold text-berry-foreground shadow-soft">
                  {discountLabel(product.discount_type, product.discount_value)}
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <ul className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
                {gallery.slice(0, 5).map((src, index) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`block size-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors sm:size-14 ${
                        index === activeImage
                          ? "border-berry"
                          : "border-border/50 hover:border-berry/40"
                      }`}
                    >
                      <img src={src} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            <DialogHeader className="space-y-1 text-left">
              <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                {product.category_name}
              </p>
              <DialogTitle className="font-blogh text-lg leading-tight font-bold tracking-wide text-cocoa uppercase sm:text-xl">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                {description ?? "Baked fresh the morning of your slot."}
              </DialogDescription>
            </DialogHeader>

            {hasVariants && (
              <div>
                <p className="mb-1.5 text-[11px] font-bold text-cocoa">Choose a size</p>
                <ul className="space-y-1.5">
                  {variants.map((v) => {
                    const selected = v.id === variant?.id;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => setVariantId(v.id)}
                          aria-pressed={selected}
                          className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                            selected
                              ? "border-berry bg-berry/10 shadow-2xs"
                              : "border-border/70 bg-secondary/30 hover:border-berry/40"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-cocoa">
                              {selected && <Check className="size-3 shrink-0 text-berry-deep" />}
                              <span className="truncate">{v.label}</span>
                            </span>
                            {v.serves && (
                              <span className="block text-[10px] text-muted-foreground">
                                Serves {v.serves}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-cocoa tabular-nums">
                            {formatCurrency(
                              finalPrice(v.price, product.discount_type, product.discount_value),
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {(product.serving_yield || product.unit_weight_grams) && !hasVariants && (
              <p className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-[11px] font-semibold text-cocoa">
                {product.unit_weight_grams
                  ? `Approx. ${product.unit_weight_grams}g per unit`
                  : product.serving_yield}
              </p>
            )}

            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sunrise className="size-3.5 shrink-0 text-berry-deep" />
              Baked at 4 AM for your chosen next-day slot.
            </p>

            <div className="mt-auto space-y-2.5 border-t border-border/60 pt-3">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {quantity > 1 ? `${quantity} × ${formatCurrency(price)}` : "Price"}
                  </p>
                  <p className="font-sans text-2xl leading-none font-black text-cocoa tabular-nums">
                    {formatCurrency(price * quantity)}
                  </p>
                  {discounted && (
                    <s className="text-[11px] font-semibold text-muted-foreground">
                      {formatCurrency(basePrice * quantity)}
                    </s>
                  )}
                </div>

                <div className="flex h-10 items-center gap-1 rounded-full border border-border/70 bg-secondary/60 px-1.5">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid size-7 cursor-pointer place-items-center rounded-full bg-card text-cocoa shadow-2xs transition hover:bg-background active:scale-90"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-cocoa tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(30, q + 1))}
                    className="grid size-7 cursor-pointer place-items-center rounded-full bg-berry text-berry-foreground shadow-2xs transition hover:bg-berry/90 active:scale-90"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-berry text-sm font-bold text-berry-foreground shadow-soft transition-transform hover:scale-[1.01] active:scale-95"
              >
                <ShoppingBag className="size-4" />
                Add to cart
              </button>

              <Link
                to="/shop/$slug"
                params={{ slug: product.slug }}
                onClick={() => onOpenChange(false)}
                className="group flex items-center justify-center gap-1 text-[11px] font-bold text-berry-deep hover:underline"
              >
                See full details, reviews and photos
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
