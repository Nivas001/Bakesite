export type DiscountType = "none" | "percent" | "flat";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_type: DiscountType;
  discount_value: number;
  image_url: string | null;
  stock: number;
  category_id: string | null;
  category_name?: string | null;
  category_slug?: string | null;
}

export function finalPrice(
  price: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (discountType === "percent") {
    return Math.max(0, Math.round(price * (1 - discountValue / 100) * 100) / 100);
  }
  if (discountType === "flat") {
    return Math.max(0, Math.round((price - discountValue) * 100) / 100);
  }
  return price;
}

export function hasDiscount(discountType: DiscountType, discountValue: number): boolean {
  return discountType !== "none" && discountValue > 0;
}

export function discountLabel(discountType: DiscountType, discountValue: number): string {
  if (discountType === "percent") return `${discountValue % 1 === 0 ? discountValue : discountValue.toFixed(1)}% off`;
  if (discountType === "flat") return `₹${discountValue} off`;
  return "";
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}