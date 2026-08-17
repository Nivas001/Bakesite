import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  discountLabel,
  finalPrice,
  formatCurrency,
  hasDiscount,
  type CatalogProduct,
} from "@/lib/pricing";
import { getCategoryTheme } from "@/lib/category-theme";

/**
 * Safely renders mixed alphanumeric text without missing glyphs in Blogh.
 */
function SafeProductTitle({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\d+[°%kK\w-]*|3D|&)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^(\d|3D|&)/.test(part)) {
          return (
            <span key={i} className="font-sans font-black tracking-normal">
              {part}
            </span>
          );
        }
        return (
          <span key={i} className="font-blogh">
            {part}
          </span>
        );
      })}
    </span>
  );
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { lines, add, setQuantity } = useCart();
  const theme = getCategoryTheme(product.category_slug);
  const price = finalPrice(product.price, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  const cartLine = lines.find((l) => l.productId === product.id);
  const quantityInCart = cartLine?.quantity ?? 0;

  return (
    <article
      className={`group flex flex-col justify-between rounded-[1.85rem] sm:rounded-[2.25rem] border-2 ${theme.cardBorder} ${theme.cardBg} p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1.5 ${theme.cardShadow} relative overflow-hidden`}
    >
      {/* Top Image Frame with Rounded Bento Border */}
      <div className="relative">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="relative block overflow-hidden rounded-[1.35rem] sm:rounded-[1.75rem] border border-black/10 bg-black/5 shadow-inner"
        >
          <img
            src={product.image_url ?? "/products/croissant.jpg"}
            alt={product.name}
            loading="lazy"
            width={600}
            height={600}
            className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
          />

          {/* Discount Badge */}
          {discounted && (
            <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full bg-[#E11D48] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-md">
              {discountLabel(product.discount_type, product.discount_value)}
            </span>
          )}

          {/* Category Tag Pill (Top Right) */}
          <span
            className={`absolute right-2.5 top-2.5 sm:right-3 sm:top-3 inline-flex items-center gap-1 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9.5px] sm:text-[11px] font-bold shadow-xs backdrop-blur-md`}
          >
            <span>{theme.icon}</span>
            <span className="truncate max-w-[80px] sm:max-w-[100px]">
              {product.category_name ?? theme.shortName}
            </span>
          </span>

          {/* Price Tag Overlay (Bottom Right) */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex flex-col items-end">
            {discounted && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-white/90 line-through drop-shadow-md mb-0.5">
                {formatCurrency(product.price)}
              </span>
            )}
            <span
              className={`rounded-full ${theme.priceBg} px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-black font-sans shadow-lg backdrop-blur-md`}
            >
              {formatCurrency(price)}
            </span>
          </div>
        </Link>
      </div>

      {/* Product Information & Quick Actions */}
      <div className="flex flex-1 flex-col justify-between gap-2.5 pt-3 sm:pt-4 px-1">
        <div className="space-y-1">
          {/* Category Subtitle */}
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${theme.textSub}`}>
            {product.category_name ?? theme.shortName}
          </p>

          {/* Title in SafeBloghText */}
          <h3
            className={`text-sm sm:text-base lg:text-lg font-bold uppercase tracking-tight leading-snug line-clamp-2 ${theme.textHeading}`}
          >
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="hover:opacity-80 transition-opacity"
            >
              <SafeProductTitle text={product.name} />
            </Link>
          </h3>

          {/* Product Description */}
          {product.description && (
            <p className="line-clamp-2 text-[11px] sm:text-xs text-zinc-600 leading-relaxed font-medium pt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom Cart Action Bar */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-black/5">
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 hidden xs:inline-block">
            {product.stock > 0 ? "Fresh Slot Today" : "Sold Out"}
          </span>

          {quantityInCart === 0 ? (
            <button
              type="button"
              className={`inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full ${theme.buttonBg} ${theme.buttonHover} ${theme.buttonText} px-3.5 sm:px-4 text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ml-auto`}
              onClick={() => {
                add({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  unitPrice: price,
                  basePrice: product.price,
                  imageUrl: product.image_url,
                });
                toast.success(`${product.name} added to cart`);
              }}
            >
              <Plus className="size-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 border border-black/15 shadow-sm ml-auto">
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 transition-all hover:bg-zinc-200 active:scale-90 cursor-pointer"
                onClick={() => {
                  setQuantity(product.id, quantityInCart - 1);
                  if (quantityInCart - 1 === 0) {
                    toast.info(`Removed ${product.name} from cart`);
                  }
                }}
              >
                <Minus className="size-3" />
              </button>

              <span className="min-w-5 px-1 text-center text-xs font-black text-zinc-900 font-sans tabular-nums">
                {quantityInCart}
              </span>

              <button
                type="button"
                aria-label={`Increase ${product.name} quantity`}
                className={`flex size-6 items-center justify-center rounded-full ${theme.buttonBg} ${theme.buttonText} transition-all hover:opacity-90 active:scale-90 cursor-pointer`}
                onClick={() => {
                  setQuantity(product.id, Math.min(30, quantityInCart + 1));
                }}
              >
                <Plus className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;