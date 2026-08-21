import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  generateSmartCakeWeightVariants,
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
  Plus,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { uploadProductImageAdmin } from "@/lib/admin.functions";
import type { ProductForm } from "@/components/admin-product-editor-dialog";

export { type ProductForm, EMPTY_FORM } from "@/components/admin-product-editor-dialog";

interface AdminProductFormProps {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  categories: { id: string; name: string; slug?: string }[];
  onSave: () => Promise<void>;
  onCancel?: () => void;
  saving: boolean;
  uploadingImage: boolean;
  setUploadingImage: (v: boolean) => void;
  productImageInputRef: React.RefObject<HTMLInputElement | null>;
  manualUrlMode: boolean;
  setManualUrlMode: (v: boolean) => void;
  manualUrlInput: string;
  setManualUrlInput: (v: string) => void;
}

export function AdminProductForm({
  form,
  setForm,
  categories,
  onSave,
  onCancel,
  saving,
  uploadingImage,
  setUploadingImage,
  productImageInputRef,
  manualUrlMode,
  setManualUrlMode,
  manualUrlInput,
  setManualUrlInput,
}: AdminProductFormProps) {
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
    <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft h-fit sticky top-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-xl bg-berry/10 border border-berry/25 flex items-center justify-center text-sm shrink-0">
            {form.id ? "✏️" : "🧁"}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold text-cocoa truncate">
              {form.id ? `Edit: ${form.name || "Bake"}` : "Add New Artisan Bake"}
            </h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {form.id ? "Update pricing & details" : "Add recipe to shop catalog"}
            </p>
          </div>
        </div>

        {form.id ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-7 px-2 text-[11px] font-bold text-berry hover:bg-berry/10 rounded-lg cursor-pointer flex items-center gap-1"
            title="Clear and switch to new bake mode"
          >
            <Plus className="size-3" />
            <span>New</span>
          </Button>
        ) : (
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            New Item
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* SECTION 1: Basic Info */}
        <div className="space-y-3 rounded-2xl bg-secondary/20 p-3.5 border border-border/60">
          <div className="flex items-center gap-1.5 font-bold text-cocoa uppercase tracking-wider text-[11px]">
            <Sparkles className="size-3.5 text-berry" />
            <span>1. Basic Info</span>
          </div>

          <div>
            <Label htmlFor="side-name" className="text-[11px] font-semibold">
              Product Name <span className="text-berry">*</span>
            </Label>
            <Input
              id="side-name"
              value={form.name}
              placeholder="e.g. Sourdough Loaf or Bento Cake"
              className="rounded-xl h-8 text-xs mt-1 bg-background"
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
            <Label htmlFor="side-slug" className="text-[11px] font-semibold">
              URL Slug <span className="text-muted-foreground font-normal">(/shop/...)</span>
            </Label>
            <Input
              id="side-slug"
              value={form.slug}
              placeholder="sourdough-loaf"
              className="rounded-xl h-8 text-xs font-mono mt-1 bg-background"
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="side-cat" className="text-[11px] font-semibold">
              Category
            </Label>
            <select
              id="side-cat"
              className="h-8 w-full rounded-xl border border-input bg-background px-2.5 text-xs mt-1 cursor-pointer font-medium"
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
            <Label htmlFor="side-desc" className="text-[11px] font-semibold">
              Description &amp; Baker Notes
            </Label>
            <Textarea
              id="side-desc"
              value={form.description}
              rows={2}
              placeholder="Freshly baked artisan recipe…"
              className="rounded-xl text-xs mt-1 bg-background resize-none"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        {/* SECTION 2: Pricing & Discounts */}
        <div className="space-y-3 rounded-2xl bg-secondary/20 p-3.5 border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-cocoa uppercase tracking-wider text-[11px]">
              <Tag className="size-3.5 text-berry" />
              <span>2. Pricing &amp; Discounts</span>
            </div>
            <span className="font-bold text-berry text-xs">
              Pays: {formatCurrency(finalCalculatedPrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label htmlFor="side-price" className="text-[11px] font-semibold">
                Base Price (₹) <span className="text-berry">*</span>
              </Label>
              <Input
                id="side-price"
                type="number"
                value={form.price}
                className="rounded-xl h-8 text-xs mt-1 bg-background font-bold text-cocoa"
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
              <Label htmlFor="side-dtype" className="text-[11px] font-semibold">
                Discount Type
              </Label>
              <select
                id="side-dtype"
                className="h-8 w-full rounded-xl border border-input bg-background px-2 text-xs mt-1 cursor-pointer"
                value={form.discount_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discount_type: e.target.value as ProductForm["discount_type"],
                  }))
                }
              >
                <option value="none">None</option>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
          </div>

          {form.discount_type !== "none" && (
            <div>
              <Label htmlFor="side-dval" className="text-[11px] font-semibold">
                Discount Value ({form.discount_type === "percent" ? "%" : "₹"})
              </Label>
              <Input
                id="side-dval"
                type="number"
                value={form.discount_value}
                placeholder={form.discount_type === "percent" ? "10" : "50"}
                className="rounded-xl h-8 text-xs mt-1 bg-background"
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* SECTION 3: Portion & Sizing Mode */}
        <div className="space-y-3 rounded-2xl bg-secondary/20 p-3.5 border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-cocoa uppercase tracking-wider text-[11px]">
              <Layers className="size-3.5 text-berry" />
              <span>3. Sizing Mode</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {form.item_type === "weight" ? "Cake tiers" : "Unit / piece"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
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
              className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                form.item_type === "weight"
                  ? "border-berry bg-berry/15 text-berry ring-1 ring-berry"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>🎂 Weight Tiers</span>
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
              className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                form.item_type !== "weight"
                  ? "border-berry bg-berry/15 text-berry ring-1 ring-berry"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>🍩 Unit / Piece</span>
            </button>
          </div>

          {form.item_type === "weight" ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Tiered volume discounts
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const base = Number(form.price) || 300;
                    const calculated = generateSmartCakeWeightVariants(base, 250);
                    setForm((f) => ({ ...f, weight_variants: calculated }));
                    toast.success(`Tiers recalculated for ₹${base} base!`);
                  }}
                  className="text-[10px] font-bold text-berry hover:underline cursor-pointer"
                >
                  ⚡ Auto Tiers
                </button>
              </div>

              <div className="space-y-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-2">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-[9px] uppercase">
                      <th className="py-1">Size</th>
                      <th className="py-1">Price (₹)</th>
                      <th className="py-1 text-right">Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {form.weight_variants.map((v, vIdx) => (
                      <tr key={v.id}>
                        <td className="py-1 font-bold text-cocoa">{v.label}</td>
                        <td className="py-1">
                          <Input
                            type="number"
                            value={v.price}
                            className="h-6 w-16 text-xs font-bold rounded-lg bg-background p-1"
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = [...form.weight_variants];
                              updated[vIdx] = { ...v, price: val };
                              setForm((f) => ({ ...f, weight_variants: updated }));
                            }}
                          />
                        </td>
                        <td className="py-1 text-right">
                          {v.savings_label ? (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1 py-0.5 rounded">
                              {v.savings_label}
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">Base</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <Label htmlFor="side-unit-wt" className="text-[10px] font-semibold">
                  Unit Weight (g)
                </Label>
                <Input
                  id="side-unit-wt"
                  type="number"
                  placeholder="85"
                  value={form.unit_weight_grams}
                  className="rounded-xl h-8 text-xs mt-0.5 bg-background"
                  onChange={(e) => setForm((f) => ({ ...f, unit_weight_grams: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="side-serv-yield" className="text-[10px] font-semibold">
                  Portion Note
                </Label>
                <Input
                  id="side-serv-yield"
                  placeholder="e.g. 16–18 Pieces"
                  value={form.serving_yield}
                  className="rounded-xl h-8 text-xs mt-0.5 bg-background"
                  onChange={(e) => setForm((f) => ({ ...f, serving_yield: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Multi-Photo Gallery & Pinned Cover */}
        <div className="space-y-3 rounded-2xl bg-secondary/20 p-3.5 border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-cocoa uppercase tracking-wider text-[11px]">
              <ImageIcon className="size-3.5 text-berry" />
              <span>4. Photos ({attachedImages.length})</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {attachedImages.length > 0 ? "Carousel enabled" : "No photos"}
            </span>
          </div>

          {/* Thumbnails */}
          {attachedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {attachedImages.filter(Boolean).map((img, idx) => {
                const isPinned = form.image_url ? form.image_url === img : idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border p-1 bg-card flex flex-col justify-between ${
                      isPinned ? "border-berry ring-1 ring-berry/30" : "border-border/70"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/products/artisan-croissant.jpg";
                        }}
                      />
                      {isPinned && (
                        <span className="absolute top-1 left-1 rounded bg-berry text-berry-foreground px-1 py-0.2 text-[8px] font-bold">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-0.5">
                      {!isPinned ? (
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, image_url: img }));
                            toast.success(`Photo #${idx + 1} pinned as cover!`);
                          }}
                          className="text-[9px] font-bold text-berry hover:underline cursor-pointer"
                        >
                          Pin
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600">✓ Active</span>
                      )}

                      <button
                        type="button"
                        title="Delete Photo"
                        onClick={() => {
                          setForm((f) => {
                            const imgs = (f.images && f.images.length > 0 ? f.images : [f.image_url]).filter(
                              (_, i) => i !== idx
                            );
                            const newCover = isPinned ? imgs[0] || "" : f.image_url;
                            return { ...f, images: imgs, image_url: newCover };
                          });
                        }}
                        className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload input */}
          <div className="space-y-2 pt-1">
            <input
              ref={productImageInputRef}
              type="file"
              id="side-multi-image-file"
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
                      id: "uploading-side-photo",
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
                        f.images && f.images.length > 0 ? f.images : f.image_url ? [f.image_url] : [];
                      return {
                        ...f,
                        images: [...current, ...newUploadedUrls],
                        image_url: f.image_url || newUploadedUrls[0] || "",
                      };
                    });
                    toast.success(
                      `Successfully uploaded ${newUploadedUrls.length} photo${newUploadedUrls.length === 1 ? "" : "s"}!`,
                      { id: "uploading-side-photo" }
                    );
                  } else {
                    toast.dismiss("uploading-side-photo");
                  }
                } catch (err: any) {
                  console.error("Photo upload error:", err);
                  toast.error(err?.message || "Failed to upload photo to storage.", {
                    id: "uploading-side-photo",
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
                size="sm"
                disabled={uploadingImage}
                onClick={() => productImageInputRef.current?.click()}
                className="flex-1 rounded-xl h-8 text-[11px] font-semibold hover:border-berry/50 flex items-center justify-center gap-1.5 cursor-pointer bg-background"
              >
                <Camera className="size-3.5 text-berry" />
                <span>{uploadingImage ? "Uploading to Storage…" : "+ Upload Photos (Multiple)"}</span>
              </Button>
              <button
                type="button"
                onClick={() => setManualUrlMode(!manualUrlMode)}
                className="text-[11px] text-berry hover:underline font-semibold cursor-pointer"
              >
                {manualUrlMode ? "Hide URL" : "By URL"}
              </button>
            </div>

            {manualUrlMode && (
              <div className="flex gap-1.5 pt-1">
                <Input
                  placeholder="Image URL https://..."
                  value={manualUrlInput}
                  onChange={(e) => setManualUrlInput(e.target.value)}
                  className="rounded-xl h-8 text-xs flex-1 bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!manualUrlInput.trim()) return;
                    const url = manualUrlInput.trim();
                    setForm((f) => {
                      const current =
                        f.images && f.images.length > 0 ? f.images : f.image_url ? [f.image_url] : [];
                      return {
                        ...f,
                        images: [...current, url],
                        image_url: f.image_url || url,
                      };
                    });
                    setManualUrlInput("");
                    toast.success("Image URL added to gallery!");
                  }}
                  className="rounded-xl h-8 px-2.5 text-xs font-semibold bg-cocoa text-background hover:bg-cocoa/90 cursor-pointer"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Public Storefront Visibility */}
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="rounded border-input text-berry"
          />
          <span className="font-semibold text-cocoa">Visible in public shop</span>
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            disabled={saving || uploadingImage}
            onClick={onSave}
            className="flex-1 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 h-10 font-bold text-xs shadow-soft cursor-pointer"
          >
            {saving ? "Saving…" : uploadingImage ? "Uploading photo…" : form.id ? "Update Product" : "Create Product"}
          </Button>

          {form.id && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-2xl h-10 px-3 text-xs font-semibold hover:border-berry/40 cursor-pointer"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
