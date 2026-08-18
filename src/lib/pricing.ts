export type DiscountType = "none" | "percent" | "flat";

export interface ProductWeightVariant {
  id: string;
  label: string;
  weight_grams: number;
  price: number;
  serves?: string;
  savings_label?: string;
}

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
  sort_order?: number | null;
  item_type?: "weight" | "unit" | "pack" | null;
  unit_weight_grams?: number | null;
  serving_yield?: string | null;
  weight_variants?: ProductWeightVariant[] | null;
}

/**
 * Generate smart tiered weight pricing for cakes with volume discounts
 * Example: Base 250g = ₹300 -> 500g = ₹580 (5% off) -> 1kg = ₹1080 (10% off) -> 2kg = ₹2040 (15% off)
 */
export function generateSmartCakeWeightVariants(basePrice: number, baseGrams: number = 250): ProductWeightVariant[] {
  // Normalize base price to 250g
  const p250 = baseGrams === 500 ? Math.round(basePrice / (2 * 0.9667)) : Math.round(basePrice);

  const p500 = Math.round((p250 * 2 * 0.9667) / 10) * 10;
  const p1kg = Math.round((p250 * 4 * 0.90) / 10) * 10;
  const p1_5kg = Math.round((p250 * 6 * 0.875) / 10) * 10;
  const p2kg = Math.round((p250 * 8 * 0.85) / 10) * 10;

  return [
    {
      id: "250g",
      label: "250g (Bento Cake)",
      weight_grams: 250,
      price: p250,
      serves: "2–3 Guests",
    },
    {
      id: "500g",
      label: "500g (6\" Regular)",
      weight_grams: 500,
      price: p500,
      serves: "5–7 Guests",
      savings_label: `Save ₹${p250 * 2 - p500} (~5% off)`,
    },
    {
      id: "1kg",
      label: "1.0kg (8\" Family)",
      weight_grams: 1000,
      price: p1kg,
      serves: "10–14 Guests",
      savings_label: `Save ₹${p250 * 4 - p1kg} (10% off)`,
    },
    {
      id: "1.5kg",
      label: "1.5kg (9\" Grand)",
      weight_grams: 1500,
      price: p1_5kg,
      serves: "16–20 Guests",
      savings_label: `Save ₹${p250 * 6 - p1_5kg} (12.5% off)`,
    },
    {
      id: "2kg",
      label: "2.0kg (2-Tier Party)",
      weight_grams: 2000,
      price: p2kg,
      serves: "22–28 Guests",
      savings_label: `Save ₹${p250 * 8 - p2kg} (15% off)`,
    },
  ];
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