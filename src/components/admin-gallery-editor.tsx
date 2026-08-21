"use client";

import { useState, useEffect } from "react";
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
import { ReorderList, ReorderItem } from "@/components/godui/reorder-list";
import { InertiaGallery, GalleryShot } from "@/components/godui/inertia-gallery";

export function AdminGalleryEditor() {
  const { content, updateContent, resetContent, isLoading } = useSiteContent();

  const [badge, setBadge] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      label: "Signature Bake",
      image: "/products/belgian-fudge-brownie-stack.jpg",
      tag: "Fresh",
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    setIsDirty(true);
    toast.success("Added new photo to top of gallery. Fill in details and click Save.");
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
      toast.success("✨ Gallery sequence & labels successfully saved live to About page!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save gallery changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset the gallery order and labels back to factory defaults?")) {
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
            Drag and drop rows to reorder how photos appear in the 360° circular Inertia Gallery on the About page.
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
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-berry" />
                <div>
                  <h3 className="font-display text-base font-bold text-cocoa">
                    Drag-to-Swap Sequence
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Grab any row by the handle ⠿ and drag up or down to swap positions
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddPhoto}
                className="h-8 rounded-xl bg-cocoa text-background hover:bg-cocoa/90 text-xs font-bold gap-1 px-3 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Shot</span>
              </Button>
            </div>

            {/* GodUI ReorderList */}
            <div className="max-h-[560px] overflow-y-auto pr-1 no-scrollbar space-y-2">
              <ReorderList values={photos} onReorder={handleReorderPhotos}>
                {photos.map((photo, index) => (
                  <ReorderItem key={photo.id} value={photo} className="cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3 w-full">
                      {/* Drag Handle */}
                      <div className="flex items-center justify-center size-8 rounded-xl bg-secondary/80 text-muted-foreground group-hover:text-cocoa shrink-0 cursor-grab active:cursor-grabbing">
                        <GripVertical className="size-4" />
                      </div>

                      {/* Position Number */}
                      <span className="font-mono text-xs font-extrabold text-muted-foreground size-5 flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>

                      {/* Thumbnail */}
                      <img
                        src={photo.image}
                        alt={photo.label}
                        className="size-12 rounded-xl object-cover border border-border/60 shrink-0 bg-muted select-none pointer-events-none"
                      />

                      {/* Editable Fields */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                            Bottom Badge Pill
                          </span>
                          <Input
                            value={photo.label}
                            placeholder="e.g. Belgian Brownie"
                            onChange={(e) => handleUpdatePhoto(photo.id, { label: e.target.value })}
                            className="h-7.5 rounded-lg text-xs mt-0.5"
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
                            className="h-7.5 rounded-lg text-xs mt-0.5"
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
                  </ReorderItem>
                ))}
              </ReorderList>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isDirty ? "⚠️ Sequence modified — Click Save to apply" : "✅ Sequence live in sync with /about"}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!isDirty}
                className="rounded-xl text-xs font-bold bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft cursor-pointer"
              >
                <Save className="size-3.5 mr-1.5" />
                Apply Sequence to Webpage
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
                href="/about#atelier-gallery"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-berry hover:underline cursor-pointer"
              >
                <span>View Public Page</span>
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

            <p className="text-[11px] text-center text-muted-foreground">
              💡 As you drag and swap cards on the left, the preview updates immediately to reflect the new sequence!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
