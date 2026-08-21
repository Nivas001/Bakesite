"use client";

import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Camera,
  GripVertical,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  ArrowRight,
  ExternalLink,
  ImageIcon,
  Upload,
  Loader2,
  Check,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useSiteContent,
  DEFAULT_SITE_CONTENT,
  type GalleryPhoto,
  type SiteContent,
} from "@/lib/site-content";
import { uploadProductImageAdmin } from "@/lib/admin.functions";
import { ReorderList, ReorderItem } from "@/components/godui/reorder-list";
import { InertiaGallery, GalleryShot } from "@/components/godui/inertia-gallery";

const PRESET_BAKERY_PHOTOS = [
  { label: "Belgian Fudge Brownie Stack", image: "/products/belgian-fudge-brownie-stack.jpg" },
  { label: "Basque Strawberry Cheesecake", image: "/products/strawberry-cheesecake.jpg" },
  { label: "Artisan Sourdough Loaf", image: "/products/artisan-sourdough.jpg" },
  { label: "French Butter Croissant", image: "/products/artisan-croissant.jpg" },
  { label: "Rosemilk Teatime Cake", image: "/products/rosemilk-tea-cake.jpg" },
  { label: "Pistachio Custard Danish", image: "/products/pistachio-danish.jpg" },
  { label: "Salted Caramel Cupcake", image: "/about/salted-caramel-cupcake.jpg" },
  { label: "Royal Gilded Brownie", image: "/cakes/royal-gold-brownie.jpg" },
  { label: "Dark Belgian Truffle Cake", image: "/cakes/belgian-truffle-cake.jpg" },
  { label: "Biscoff Herringbone Cake", image: "/cakes/biscoff-herringbone-cake.jpg" },
  { label: "Pink Bento Cake", image: "/cakes/pink-bento-cake.jpg" },
  { label: "Matcha Sea Salt Cookies", image: "/products/matcha-cookies.jpg" },
  { label: "Country Sourdough", image: "/products/country-sourdough.jpg" },
  { label: "Cinnamon Swirl Bun", image: "/products/cinnamon-bun.jpg" },
  { label: "Walnut Cupcake Trio", image: "/about/walnut-cupcake-trio.jpg" },
  { label: "Artisan Cookies Collection", image: "/products/artisan-cookies.jpg" },
];

export function AdminGalleryEditor() {
  const { content, updateContent, resetContent, isLoading } = useSiteContent();
  const uploadImageFn = useServerFn(uploadProductImageAdmin);

  const [badge, setBadge] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const globalFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when content loads from server
  useEffect(() => {
    if (content?.about_gallery) {
      const g = content.about_gallery;
      setBadge(g.badge || DEFAULT_SITE_CONTENT.about_gallery.badge);
      setTitle(g.title || DEFAULT_SITE_CONTENT.about_gallery.title);
      setDescription(g.description || DEFAULT_SITE_CONTENT.about_gallery.description);
      setPhotos(
        g.photos && Array.isArray(g.photos) && g.photos.length > 0
          ? g.photos
          : DEFAULT_SITE_CONTENT.about_gallery.photos,
      );
      setIsDirty(false);
    }
  }, [content]);

  const handleReorderPhotos = (newOrder: GalleryPhoto[]) => {
    setPhotos(newOrder);
    setIsDirty(true);
  };

  const handleAddPhoto = () => {
    const newPhoto: GalleryPhoto = {
      id: `shot-${Date.now()}`,
      label: "Fresh Oven Bake",
      image: "/products/belgian-fudge-brownie-stack.jpg",
      tag: "Signature",
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    setIsDirty(true);
    toast.success("Added new photo slot to top of gallery. Upload photo or edit labels and click Save.");
  };

  const handleUpdatePhoto = (id: string, updated: Partial<GalleryPhoto>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    );
    setIsDirty(true);
  };

  const handleRemovePhoto = (id: string) => {
    if (photos.length <= 1) {
      toast.error("The gallery must contain at least 1 photo.");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setIsDirty(true);
    toast.info("Photo removed from gallery list.");
  };

  // Upload Photo File directly to Appwrite Storage / Cloud
  const handleUploadPhotoFile = async (photoId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file must be under 15MB.");
      return;
    }

    try {
      setUploadingId(photoId);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const rawDataUrl = e.target?.result as string;
          if (!rawDataUrl) return;

          // Temporary preview immediately
          handleUpdatePhoto(photoId, { image: rawDataUrl });

          const commaIdx = rawDataUrl.indexOf(",");
          const base64 = commaIdx !== -1 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl;

          // Upload to server storage
          const res = await uploadImageFn({
            data: {
              filename: `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
              base64,
              mimeType: file.type || "image/jpeg",
            },
          });

          if (res?.imageUrl) {
            handleUpdatePhoto(photoId, { image: res.imageUrl });
            setIsDirty(true);
            toast.success("📸 Photo uploaded & stored! Click 'Save Gallery Changes' to apply live.");
          }
        } catch (err: any) {
          toast.error(err?.message || "Failed to upload photo file.");
        } finally {
          setUploadingId(null);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingId(null);
      toast.error(err?.message || "Could not read file.");
    }
  };

  // Quick action: Upload directly as a brand new shot
  const handleGlobalNewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newId = `shot-${Date.now()}`;
    const newPhoto: GalleryPhoto = {
      id: newId,
      label: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      image: "/products/belgian-fudge-brownie-stack.jpg",
      tag: "Fresh Bake",
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setIsDirty(true);
    await handleUploadPhotoFile(newId, file);
    e.target.value = "";
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedSiteContent: SiteContent = {
        ...(content || DEFAULT_SITE_CONTENT),
        about_gallery: {
          badge: badge.trim() || DEFAULT_SITE_CONTENT.about_gallery.badge,
          title: title.trim() || DEFAULT_SITE_CONTENT.about_gallery.title,
          description: description.trim() || DEFAULT_SITE_CONTENT.about_gallery.description,
          photos: photos.map((p, idx) => ({
            id: p.id || `shot-${idx + 1}`,
            label: p.label.trim() || "Bake",
            image: p.image.trim() || "/products/belgian-fudge-brownie-stack.jpg",
            tag: p.tag?.trim() || undefined,
          })),
        },
      };

      await updateContent(updatedSiteContent);
      setIsDirty(false);
      toast.success("✨ Gallery sequence & photos successfully saved live to About page!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save gallery changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset the gallery order and photos back to factory defaults?")) {
      const def = DEFAULT_SITE_CONTENT.about_gallery;
      setBadge(def.badge);
      setTitle(def.title);
      setDescription(def.description);
      setPhotos(def.photos);
      setIsDirty(true);
      toast.info("Reset to default 12 curated portrait bakes.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden Global File Input */}
      <input
        ref={globalFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGlobalNewUpload}
      />

      {/* Studio Header Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-berry">
              About Page Gallery Atelier
            </span>
          </div>
          <h2 className="font-blogh text-2xl sm:text-3xl font-bold text-cocoa uppercase tracking-wide">
            Atelier Portraits & Inertia Gallery
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            Upload your own bakery photos, drag and drop to swap their order, and edit bottom pill labels live.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl text-xs font-semibold h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="rounded-xl text-xs font-bold h-9 bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer disabled:opacity-50"
          >
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? "Saving to Server…" : isDirty ? "Save Gallery Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Drag-and-Drop Photo Sequence & Meta (6 Columns) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Section Copywriting Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-4">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry">
                Section Headlines
              </span>
              <h3 className="font-display text-base font-bold text-cocoa">
                Gallery Copy & Headers
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <Label className="text-xs font-bold text-cocoa">Badge Eyebrow</Label>
                <Input
                  value={badge}
                  onChange={(e) => {
                    setBadge(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Atelier & Hearth Portraits"
                  className="mt-1 h-9 text-xs rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-cocoa">Main Headline</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Portraits of our daily oven craft"
                  className="mt-1 h-9 text-xs font-semibold rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-cocoa">Description</Label>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Supporting gallery description…"
                  className="mt-1 text-xs rounded-xl leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Drag & Drop Photo List Manager */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-berry" />
                <div>
                  <h3 className="font-display text-base font-bold text-cocoa">
                    Drag-to-Swap Sequence ({photos.length} Photos)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Grab ⠿ to swap order &bull; Click camera on photo to upload from computer
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => globalFileInputRef.current?.click()}
                  className="h-8 rounded-xl text-xs font-bold gap-1 px-3 hover:border-berry/40 cursor-pointer"
                >
                  <Upload className="size-3.5 text-berry" />
                  <span>Upload Photo</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPhoto}
                  className="h-8 rounded-xl bg-cocoa text-background hover:bg-cocoa/90 text-xs font-bold gap-1 px-3 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Add Slot</span>
                </Button>
              </div>
            </div>

            {/* GodUI ReorderList */}
            <div className="max-h-[600px] overflow-y-auto pr-1 no-scrollbar space-y-3">
              <ReorderList values={photos} onReorder={handleReorderPhotos}>
                {photos.map((photo, index) => {
                  const isUploadingThis = uploadingId === photo.id;
                  return (
                    <ReorderItem key={photo.id} value={photo} className="cursor-grab active:cursor-grabbing p-3.5">
                      <div className="flex flex-col gap-2.5 w-full">
                        <div className="flex items-center gap-3 w-full">
                          {/* Drag Handle */}
                          <div className="flex items-center justify-center size-8 rounded-xl bg-secondary/80 text-muted-foreground group-hover:text-cocoa shrink-0 cursor-grab active:cursor-grabbing">
                            <GripVertical className="size-4" />
                          </div>

                          {/* Position Number */}
                          <span className="font-mono text-xs font-extrabold text-muted-foreground size-5 flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>

                          {/* Interactive Thumbnail with Camera Upload Button */}
                          <div className="relative size-14 rounded-xl overflow-hidden border border-border/80 bg-muted shrink-0 group/thumb shadow-2xs">
                            <img
                              src={photo.image}
                              alt={photo.label}
                              className="size-full object-cover select-none pointer-events-none"
                            />
                            {isUploadingThis ? (
                              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-[9px] font-bold">
                                <Loader2 className="size-4 animate-spin text-amber-300" />
                                <span>Uploading</span>
                              </div>
                            ) : (
                              <label
                                htmlFor={`upload-${photo.id}`}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[9px] font-bold gap-0.5"
                                title="Click to upload custom photo"
                              >
                                <Camera className="size-4 text-amber-300" />
                                <span>Change</span>
                              </label>
                            )}
                            <input
                              id={`upload-${photo.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingThis}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadPhotoFile(photo.id, file);
                                e.target.value = "";
                              }}
                            />
                          </div>

                          {/* Editable Fields: Badge Pill Label & Tag */}
                          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                                Bottom Pill Badge Label
                              </span>
                              <Input
                                value={photo.label}
                                placeholder="e.g. Belgian Brownie"
                                onChange={(e) => handleUpdatePhoto(photo.id, { label: e.target.value })}
                                className="h-8 rounded-lg text-xs mt-0.5 font-semibold"
                              />
                            </div>
                            <div>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                                Top Tag (Optional)
                              </span>
                              <Input
                                value={photo.tag || ""}
                                placeholder="e.g. Signature"
                                onChange={(e) => handleUpdatePhoto(photo.id, { tag: e.target.value })}
                                className="h-8 rounded-lg text-xs mt-0.5 font-semibold"
                              />
                            </div>
                          </div>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(photo.id);
                            }}
                            className="size-8 p-0 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        {/* Image URL & Preset Selection Row */}
                        <div className="flex items-center gap-2 pl-16 pt-1 border-t border-border/40">
                          <div className="flex-1 min-w-0">
                            <Input
                              value={photo.image}
                              placeholder="Image URL or upload custom photo"
                              onChange={(e) => handleUpdatePhoto(photo.id, { image: e.target.value })}
                              className="h-7 text-[11px] font-mono rounded-lg bg-secondary/30"
                            />
                          </div>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdatePhoto(photo.id, { image: e.target.value });
                              }
                            }}
                            className="h-7 rounded-lg border border-input bg-card px-2 text-[11px] font-medium text-muted-foreground hover:text-cocoa cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Preset Photos ▾
                            </option>
                            {PRESET_BAKERY_PHOTOS.map((preset) => (
                              <option key={preset.image} value={preset.image}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </ReorderItem>
                  );
                })}
              </ReorderList>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isDirty ? "⚠️ Changes pending — Click Save to apply" : "✅ Sequence live in sync with /about"}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="rounded-xl text-xs font-bold bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer"
              >
                <Save className="size-3.5 mr-1.5" />
                {isSaving ? "Saving to Database…" : "Apply Sequence to Webpage"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Interactive Inertia Gallery Preview (6 Columns) */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-berry" />
                <h3 className="font-display text-base font-bold text-cocoa">
                  Live Inertia Gallery Preview
                </h3>
              </div>
              <a
                href="/about"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-berry hover:underline cursor-pointer"
              >
                <span>View Public About Page</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="text-center space-y-1.5 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-berry/10 border border-berry/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-berry">
                <Sparkles className="size-3" />
                <span>{badge || "Atelier & Hearth Portraits"}</span>
              </span>
              <h4 className="font-nimbus text-xl sm:text-2xl font-bold text-cocoa">
                {title || "Portraits of our daily oven craft"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {description || "A peek behind the proofing racks. Slow lamination, 24K gold gilding, and the purest single-origin bakes."}
              </p>
            </div>

            {/* Embedded Live Interactive Inertia Gallery */}
            <div className="py-2 overflow-hidden">
              <InertiaGallery
                snap
                itemWidth={210}
                gap={16}
                className="w-full"
              >
                {photos.map((p) => (
                  <GalleryShot
                    key={p.id}
                    image={p.image}
                    label={p.label}
                    tag={p.tag}
                  />
                ))}
              </InertiaGallery>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-3 text-center border border-border/60 text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-cocoa">📸 Dynamic Photo Storage</p>
              <p className="text-[11px]">
                Uploaded photos are processed and permanently stored in Appwrite Storage, updating the database and About page gallery live on save.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
