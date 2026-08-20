import React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricing";
import { Copy, Trash2, Eye, EyeOff, Pin, CheckCircle2 } from "lucide-react";

export function ProductAdminCard({
  product,
  categoryName,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  isBeingEdited = false,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount_type: "none" | "percent" | "flat";
    discount_value: number;
    image_url: string | null;
    images?: string[] | null;
    stock: number;
    is_active: boolean;
    category_id: string | null;
  };
  categoryName?: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onToggleActive?: () => void;
  isBeingEdited?: boolean;
}) {
  const price = Number(product.price);
  const discountType = product.discount_type;
  const discountVal = Number(product.discount_value);
  const imagesList =
    (product as any).images && Array.isArray((product as any).images)
      ? (product as any).images
      : [];

  let finalPrice = price;
  if (discountType === "percent" && discountVal > 0) {
    finalPrice = Math.max(0, price - (price * discountVal) / 100);
  } else if (discountType === "flat" && discountVal > 0) {
    finalPrice = Math.max(0, price - discountVal);
  }

  const isCake =
    product.name.toLowerCase().includes("cake") ||
    product.name.toLowerCase().includes("cheesecake");
  const itemType = (product as any).item_type || (isCake ? "weight" : "unit");

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border bg-card p-3.5 sm:p-4 shadow-soft hover:shadow-lift transition-all ${
        isBeingEdited
          ? "border-berry shadow-lift ring-2 ring-berry/40 ring-offset-1"
          : product.is_active
          ? "border-border/70 hover:border-berry/40"
          : "border-dashed border-border/60 opacity-85 hover:opacity-100 bg-muted/20"
      }`}
    >
      {/* Editing indicator banner */}
      {isBeingEdited && (
        <div className="absolute -top-2.5 left-3 right-3 flex items-center justify-center z-10">
          <span className="rounded-full bg-berry text-berry-foreground px-3 py-0.5 text-[10px] font-bold shadow-sm flex items-center gap-1">
            ✏️ Currently Editing
          </span>
        </div>
      )}
      {/* Top Image Box */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary border border-border/50 shadow-2xs">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/products/artisan-croissant.jpg";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground/50">
            🧁
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {categoryName ? (
            <span className="rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs truncate max-w-[120px]">
              {categoryName}
            </span>
          ) : (
            <span className="rounded-full bg-black/50 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white/80">
              Uncategorised
            </span>
          )}

          {discountType !== "none" && discountVal > 0 && (
            <span className="rounded-full bg-berry text-berry-foreground font-bold px-2 py-0.5 text-[10px] shadow-2xs">
              {discountType === "percent" ? `${discountVal}% OFF` : `₹${discountVal} OFF`}
            </span>
          )}
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {product.is_active ? (
            <span className="rounded-full bg-emerald-500/90 text-white backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold shadow-2xs flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span>Fresh Bake</span>
            </span>
          ) : (
            <span className="rounded-full bg-black/75 text-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold shadow-2xs">
              Paused
            </span>
          )}

          {imagesList.length > 1 && (
            <span className="rounded-md bg-black/75 text-white backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono font-bold">
              📸 {imagesList.length}
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h4
              className="font-display text-sm font-bold text-cocoa line-clamp-1 group-hover:text-berry transition-colors"
              title={product.name}
            >
              {product.name}
            </h4>
          </div>

          {/* Pricing Row */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-base font-extrabold text-cocoa">
              {formatCurrency(finalPrice)}
            </span>
            {discountType !== "none" && discountVal > 0 && (
              <span className="text-xs line-through text-muted-foreground font-normal">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Portion/Weight or Serving details */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {itemType === "weight" ? (
              <span className="rounded-md bg-berry/10 border border-berry/20 px-1.5 py-0.5 text-[10px] font-bold text-berry">
                🎂 Tiered (250g–2kg)
              </span>
            ) : (product as any).unit_weight_grams || (product as any).serving_yield ? (
              <span className="rounded-md bg-secondary/80 border border-border/50 px-1.5 py-0.5 text-[10px] font-bold text-cocoa">
                ⚖️ {(product as any).serving_yield ?? `${(product as any).unit_weight_grams}g`}
              </span>
            ) : (
              <span className="rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                Standard piece
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 flex-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-xl text-xs font-bold hover:border-berry/40 hover:bg-berry/5 hover:text-berry transition-colors cursor-pointer"
              onClick={onEdit}
            >
              ✏️ Edit
            </Button>

            {onDuplicate && (
              <Button
                size="sm"
                variant="ghost"
                title="Duplicate Bake"
                className="size-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                onClick={onDuplicate}
              >
                <Copy className="size-3.5" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleActive && (
              <Button
                size="sm"
                variant="ghost"
                title={product.is_active ? "Pause from shop" : "Activate for shop"}
                className={`size-8 p-0 rounded-xl cursor-pointer ${
                  product.is_active
                    ? "text-emerald-600 hover:bg-emerald-500/15"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
                onClick={onToggleActive}
              >
                {product.is_active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              title="Delete Product"
              className="size-8 p-0 rounded-xl text-destructive hover:bg-destructive/15 hover:text-destructive cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
