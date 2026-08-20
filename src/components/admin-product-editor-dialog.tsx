import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  generateSmartCakeWeightVariants,
  type ProductWeightVariant,
} from "@/lib/pricing";
import {
  Camera,
  Pin,
  CheckCircle2,
  Trash2,
  ImageIcon,
  Sparkles,
  Layers,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { uploadProductImageAdmin } from "@/lib/admin.functions";

export type ProductForm = {
  id?: string | undefined;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount_type: "none" | "percent" | "flat";
  discount_value: string;
  image_url: string;
  images: string[];
  stock: string;
  is_active: boolean;
  category_id: string;
  item_type: "weight" | "unit" | "pack";
  unit_weight_grams: string;
  serving_yield: string;
  weight_variants: ProductWeightVariant[];
};

export const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "300",
  discount_type: "none",
  discount_value: "0",
  image_url: "",
  images: [],
  stock: "100",
  is_active: true,
  category_id: "",
  item_type: "weight",
  unit_weight_grams: "250",
  serving_yield: "250g (Serves 2–3 Guests)",
  weight_variants: generateSmartCakeWeightVariants(300, 250),
};

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  categories: { id: string; name: string; slug?: string }[];
  onSave: () => Promise<void>;
  saving: boolean;
  uploadingImage: boolean;
  setUploadingImage: (v: boolean) => void;
  productImageInputRef: React.RefObject<HTMLInputElement | null>;
  manualUrlMode: boolean;
  setManualUrlMode: (v: boolean) => void;
  manualUrlInput: string;
  setManualUrlInput: (v: string) => void;
}

export function ProductEditorDialog({
  open,
  onOpenChange,
  form,
  setForm,
  categories,
  onSave,
  saving,
  uploadingImage,
  setUploadingImage,
  productImageInputRef,
  manualUrlMode,
  setManualUrlMode,
  manualUrlInput,
  setManualUrlInput,
}: ProductEditorDialogProps) {
  const uploadImageFn = useServerFn(uploadProductImageAdmin);
  const priceNum = Math.max(0, Number(form.price) || 0);
  const discountVal = Math.max(0, Number(form.discount_value) || 0);
  let finalCalculatedPrice = priceNum;
  if (form.discount_type === "percent" && discountVal > 0) {
    finalCalculatedPrice = Math.max(0, priceNum - (priceNum * discountVal) / 100);
  } else if (form.discount_type === "flat" && discountVal > 0) {
    finalCalculatedPrice = Math.max(0, priceNum - discountVal);
  }

  const attachedImages =
    form.images && form.images.length > 0
      ? form.images
      : form.image_url
        ? [form.image_url]
        : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto bg-card border border-border/80 shadow-lift">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-2xl bg-berry/15 text-berry flex items-center justify-center text-xl shadow-2xs">
                {form.id ? "✏️" : "🎂"}
              </div>
              <div>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-cocoa">
                  {form.id ? "Edit Bakery Bake" : "Add New Artisan Bake"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {form.id
                    ? `Updating "${form.name || "bake"}" with real-time storefront synchronization.`
                    : "Add a new freshly baked recipe to the Ani Bakes catalog."}
                </DialogDescription>
              </div>
            </div>

            {form.id && (
              <span className="rounded-full bg-berry/15 border border-berry/30 px-3 py-1 text-xs font-bold text-berry shrink-0">
                ID: #{form.id.slice(-6)}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* SECTION 1: Core Bake Details */}
          <div className="space-y-4 rounded-2xl bg-secondary/20 p-4 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-cocoa uppercase tracking-wider">
              <Sparkles className="size-4 text-berry" />
              <span>1. Basic Product Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="dlg-name" className="text-xs font-semibold">
                  Product Name <span className="text-berry">*</span>
                </Label>
                <Input
                  id="dlg-name"
                  value={form.name}
                  placeholder="e.g. Sourdough Loaf or Triple Berry Cake"
                  className="rounded-xl h-9 text-xs mt-1 bg-background"
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: f.id
                        ? f.slug
                        : name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                    }));
                  }}
                />
              </div>

              <div>
                <Label htmlFor="dlg-slug" className="text-xs font-semibold">
                  URL Slug <span className="text-muted-foreground font-normal">(/product/...)</span>
                </Label>
                <Input
                  id="dlg-slug"
                  value={form.slug}
                  placeholder="triple-berry-cake"
                  className="rounded-xl h-9 text-xs font-mono mt-1 bg-background"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dlg-cat" className="text-xs font-semibold">
                Bakery Category
              </Label>
              <select
                id="dlg-cat"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs mt-1 cursor-pointer font-medium"
                value={form.category_id}
                onChange={(e) => {
                  const catId = e.target.value;
                  const catObj = categories.find((c) => c.id === catId);
                  const catSlug = catObj?.slug?.toLowerCase() || "";
                  const isCake = catSlug === "cakes" || catSlug === "cheesecakes";

                  setForm((f) => ({
                    ...f,
                    category_id: catId,
                    item_type: isCake ? "weight" : "unit",
                    unit_weight_grams: isCake
                      ? "250"
                      : catSlug === "tea-cakes"
                        ? "300"
                        : catSlug === "breads"
                          ? "650"
                          : "85",
                    serving_yield: isCake
                      ? "250g (Serves 2–3 Guests)"
                      : catSlug === "tea-cakes"
                        ? "300g (16–18 Pieces)"
                        : catSlug === "breads"
                          ? "Approx. 650g artisan loaf"
                          : "Approx. 85g each",
                    weight_variants: isCake
                      ? generateSmartCakeWeightVariants(Number(f.price) || 300, 250)
                      : [],
                  }));
                }}
              >
                <option value="">Uncategorised</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dlg-desc" className="text-xs font-semibold">
                Description & Baker Notes
              </Label>
              <Textarea
                id="dlg-desc"
                value={form.description}
                rows={2}
                placeholder="Baked fresh daily with slow fermentation and French butter…"
                className="rounded-xl text-xs mt-1 bg-background resize-none"
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* SECTION 2: Pricing & Discounts */}
          <div className="space-y-4 rounded-2xl bg-secondary/20 p-4 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cocoa uppercase tracking-wider">
                <Tag className="size-4 text-berry" />
                <span>2. Pricing &amp; Discounts</span>
              </div>
              <div className="text-xs font-semibold text-cocoa">
                Customer Pays:{" "}
                <span className="font-bold text-berry text-sm">
                  {formatCurrency(finalCalculatedPrice)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <Label htmlFor="dlg-price" className="text-xs font-semibold">
                  Base Price (₹) <span className="text-berry">*</span>
                </Label>
                <Input
                  id="dlg-price"
                  type="number"
                  value={form.price}
                  className="rounded-xl h-9 text-xs mt-1 bg-background font-bold text-cocoa"
                  onChange={(e) => {
                    const price = e.target.value;
                    setForm((f) => ({
                      ...f,
                      price,
                      weight_variants:
                        f.item_type === "weight"
                          ? generateSmartCakeWeightVariants(Number(price) || 300, 250)
                          : f.weight_variants,
                    }));
                  }}
                />
              </div>

              <div>
                <Label htmlFor="dlg-dtype" className="text-xs font-semibold">
                  Discount Type
                </Label>
                <select
                  id="dlg-dtype"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs mt-1 cursor-pointer"
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discount_type: e.target.value as ProductForm["discount_type"],
                    }))
                  }
                >
                  <option value="none">No Discount</option>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Cash Off (₹)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="dlg-dval" className="text-xs font-semibold">
                  Discount Value
                </Label>
                <Input
                  id="dlg-dval"
                  type="number"
                  value={form.discount_value}
                  disabled={form.discount_type === "none"}
                  placeholder={form.discount_type === "percent" ? "e.g. 10%" : "e.g. 50"}
                  className="rounded-xl h-9 text-xs mt-1 bg-background"
                  onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Portion & Sizing Mode */}
          <div className="space-y-4 rounded-2xl bg-secondary/20 p-4 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cocoa uppercase tracking-wider">
                <Layers className="size-4 text-berry" />
                <span>3. Portion &amp; Sizing Mode</span>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {form.item_type === "weight" ? "Tiered cake weights" : "Piece / batch weight"}
              </span>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const newVariants =
                    form.weight_variants.length > 0
                      ? form.weight_variants
                      : generateSmartCakeWeightVariants(Number(form.price) || 300, 250);
                  setForm((f) => ({
                    ...f,
                    item_type: "weight",
                    weight_variants: newVariants,
                    unit_weight_grams: "250",
                    serving_yield: "250g (Serves 2–3 Guests)",
                  }));
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  form.item_type === "weight"
                    ? "border-berry bg-berry/15 text-berry ring-1 ring-berry"
                    : "border-border/70 bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span>🎂 Weight-Scaled (Cakes &amp; Cheesecakes)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    item_type: "unit",
                    unit_weight_grams: f.unit_weight_grams || "85",
                    serving_yield: f.serving_yield || "Approx. 85g / piece",
                  }));
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  form.item_type !== "weight"
                    ? "border-berry bg-berry/15 text-berry ring-1 ring-berry"
                    : "border-border/70 bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span>🍩 Unit / Piece (Donuts, Tea Cakes, Breads)</span>
              </button>
            </div>

            {/* Mode Content */}
            {form.item_type === "weight" ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <p className="text-[11px] text-muted-foreground">
                    Auto-volume discounts: <strong>500g is ~5% off</strong>, <strong>1kg is 10% off</strong>, <strong>2kg is 15% off</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const base = Number(form.price) || 300;
                      const calculated = generateSmartCakeWeightVariants(base, 250);
                      setForm((f) => ({ ...f, weight_variants: calculated }));
                      toast.success(`Generated smart tiers from ₹${base} base (250g)!`);
                    }}
                    className="text-[11px] font-bold text-berry hover:underline cursor-pointer"
                  >
                    ⚡ Re-calculate Tiers
                  </button>
                </div>

                <div className="space-y-1.5 overflow-x-auto rounded-xl border border-border/60 bg-card p-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                        <th className="py-1.5">Size / Weight</th>
                        <th className="py-1.5">Servings</th>
                        <th className="py-1.5">Price (₹)</th>
                        <th className="py-1.5 text-right">Savings Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {form.weight_variants.map((v, vIdx) => (
                        <tr key={v.id}>
                          <td className="py-1.5 font-bold text-cocoa">{v.label}</td>
                          <td className="py-1.5 text-muted-foreground text-[11px]">
                            {v.serves ?? "—"}
                          </td>
                          <td className="py-1.5">
                            <Input
                              type="number"
                              value={v.price}
                              className="h-7 w-24 text-xs font-bold rounded-lg bg-background"
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = [...form.weight_variants];
                                updated[vIdx] = { ...v, price: val };
                                setForm((f) => ({ ...f, weight_variants: updated }));
                              }}
                            />
                          </td>
                          <td className="py-1.5 text-right">
                            {v.savings_label ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {v.savings_label}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Base</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="dlg-unit-wt" className="text-xs font-semibold">
                    Unit / Loaf Weight (Grams)
                  </Label>
                  <Input
                    id="dlg-unit-wt"
                    type="number"
                    placeholder="85 (donut), 300 (tea cake), 650 (bread)"
                    value={form.unit_weight_grams}
                    className="rounded-xl h-9 text-xs mt-1 bg-background"
                    onChange={(e) => setForm((f) => ({ ...f, unit_weight_grams: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dlg-serv-yield" className="text-xs font-semibold">
                    Portion / Slice Yield Note
                  </Label>
                  <Input
                    id="dlg-serv-yield"
                    placeholder="e.g. 16–18 Pieces or Approx. 85g each"
                    value={form.serving_yield}
                    className="rounded-xl h-9 text-xs mt-1 bg-background"
                    onChange={(e) => setForm((f) => ({ ...f, serving_yield: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Gallery & Cover Photo */}
          <div className="space-y-4 rounded-2xl bg-secondary/20 p-4 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cocoa uppercase tracking-wider">
                <ImageIcon className="size-4 text-berry" />
                <span>4. Photo Gallery &amp; Pinned Cover</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {attachedImages.length} photo{attachedImages.length === 1 ? "" : "s"} attached
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Add multiple photos to create an interactive product carousel. Click <strong>Pin as Cover</strong> to select the photo displayed on the storefront catalog cards.
            </p>

            {/* Gallery Grid */}
            {attachedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {attachedImages.filter(Boolean).map((img, idx) => {
                  const isPinned = form.image_url ? form.image_url === img : idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-1.5 bg-card flex flex-col justify-between ${
                        isPinned
                          ? "border-berry ring-2 ring-berry/30 shadow-xs"
                          : "border-border/70 hover:border-berry/40"
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-secondary">
                        <img
                          src={img}
                          alt={`Product photo ${idx + 1}`}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/products/artisan-croissant.jpg";
                          }}
                        />
                        {isPinned && (
                          <span className="absolute top-1.5 left-1.5 rounded-full bg-berry text-berry-foreground px-2 py-0.5 text-[9px] font-bold shadow-xs flex items-center gap-1">
                            <Pin className="size-2.5" />
                            <span>Cover</span>
                          </span>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 text-white backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono font-bold">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-1">
                        {!isPinned ? (
                          <button
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, image_url: img }));
                              toast.success(`Photo #${idx + 1} pinned as primary cover!`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-berry hover:underline py-1 px-1 rounded-lg hover:bg-berry/10 cursor-pointer"
                          >
                            <Pin className="size-3" />
                            <span>Pin Cover</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 py-1 px-1 flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Active</span>
                          </span>
                        )}

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            title="Move Left"
                            onClick={() => {
                              setForm((f) => {
                                const imgs = [
                                  ...(f.images && f.images.length > 0
                                    ? f.images
                                    : [f.image_url]),
                                ];
                                const [moved] = imgs.splice(idx, 1);
                                imgs.splice(idx - 1, 0, moved!);
                                return { ...f, images: imgs };
                              });
                            }}
                            className="size-6 rounded-md hover:bg-secondary flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={idx === attachedImages.length - 1}
                            title="Move Right"
                            onClick={() => {
                              setForm((f) => {
                                const imgs = [
                                  ...(f.images && f.images.length > 0
                                    ? f.images
                                    : [f.image_url]),
                                ];
                                const [moved] = imgs.splice(idx, 1);
                                imgs.splice(idx + 1, 0, moved!);
                                return { ...f, images: imgs };
                              });
                            }}
                            className="size-6 rounded-md hover:bg-secondary flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            title="Delete Photo"
                            onClick={() => {
                              setForm((f) => {
                                const imgs = (
                                  f.images && f.images.length > 0
                                    ? f.images
                                    : [f.image_url]
                                ).filter((_, i) => i !== idx);
                                const newCover = isPinned ? imgs[0] || "" : f.image_url;
                                return { ...f, images: imgs, image_url: newCover };
                              });
                            }}
                            className="size-6 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload & Add URL controls */}
            <div className="space-y-2 pt-1">
              <input
                ref={productImageInputRef}
                type="file"
                id="dlg-multi-image-file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  setUploadingImage(true);
                  const newUploadedUrls: string[] = [];

                  try {
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      if (!file) continue;
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error(`"${file.name}" exceeds 10MB limit.`);
                        continue;
                      }

                      toast.loading(`Uploading photo ${i + 1} of ${files.length} to storage…`, {
                        id: "uploading-product-photo",
                      });

                      const reader = new FileReader();
                      const dataUrl = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });

                      const commaIdx = dataUrl.indexOf(",");
                      const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;

                      const uploadRes = await uploadImageFn({
                        data: {
                          filename: file.name,
                          base64,
                          mimeType: file.type || "image/jpeg",
                        },
                      });

                      if (uploadRes?.imageUrl) {
                        newUploadedUrls.push(uploadRes.imageUrl);
                      }
                    }

                    if (newUploadedUrls.length > 0) {
                      setForm((f) => {
                        const current =
                          f.images && f.images.length > 0
                            ? f.images
                            : f.image_url
                              ? [f.image_url]
                              : [];
                        return {
                          ...f,
                          images: [...current, ...newUploadedUrls],
                          image_url: f.image_url || newUploadedUrls[0] || "",
                        };
                      });
                      toast.success(
                        `Successfully uploaded ${newUploadedUrls.length} photo${newUploadedUrls.length === 1 ? "" : "s"}!`,
                        { id: "uploading-product-photo" }
                      );
                    } else {
                      toast.dismiss("uploading-product-photo");
                    }
                  } catch (err: any) {
                    console.error("Photo upload error:", err);
                    toast.error(err?.message || "Failed to upload photo to storage.", {
                      id: "uploading-product-photo",
                    });
                  } finally {
                    setUploadingImage(false);
                    if (productImageInputRef.current) productImageInputRef.current.value = "";
                  }
                }}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => productImageInputRef.current?.click()}
                  className="flex-1 rounded-xl h-9 text-xs font-semibold hover:border-berry/50 flex items-center justify-center gap-1.5 cursor-pointer bg-background"
                >
                  <Camera className="size-3.5 text-berry" />
                  <span>
                    {uploadingImage
                      ? "Uploading to Storage…"
                      : "+ Upload Photos from Device (Multiple)"}
                  </span>
                </Button>
                <button
                  type="button"
                  onClick={() => setManualUrlMode(!manualUrlMode)}
                  className="text-xs text-berry hover:underline font-semibold px-2 py-1 text-center cursor-pointer"
                >
                  {manualUrlMode ? "Hide URL input" : "Or add by URL"}
                </button>
              </div>

              {manualUrlMode && (
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Paste image URL (e.g. https://...)"
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    className="rounded-xl h-9 text-xs flex-1 bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!manualUrlInput.trim()) return;
                      const url = manualUrlInput.trim();
                      setForm((f) => {
                        const current =
                          f.images && f.images.length > 0
                            ? f.images
                            : f.image_url
                              ? [f.image_url]
                              : [];
                        return {
                          ...f,
                          images: [...current, url],
                          image_url: f.image_url || url,
                        };
                      });
                      setManualUrlInput("");
                      toast.success("Image URL added to gallery!");
                    }}
                    className="rounded-xl h-9 px-3 text-xs font-semibold bg-cocoa text-background hover:bg-cocoa/90 cursor-pointer"
                  >
                    + Add Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Switch */}
          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer p-3 rounded-2xl bg-secondary/30 border border-border/60">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="size-4 rounded border-input text-berry accent-berry cursor-pointer"
            />
            <div>
              <p className="text-cocoa font-bold">Visible in the Public Storefront</p>
              <p className="text-[10px] text-muted-foreground font-normal">
                When enabled, customers can view and add this item to their delivery slot basket.
              </p>
            </div>
          </label>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs h-10 px-4"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={saving || uploadingImage}
            onClick={onSave}
            className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 h-10 px-5 text-xs font-bold shadow-soft cursor-pointer"
          >
            {saving ? "Saving Bake…" : form.id ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
