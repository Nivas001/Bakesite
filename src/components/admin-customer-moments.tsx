import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useCustomerMoments,
  type CustomerMoment,
  DEFAULT_MOMENTS,
} from "@/lib/customer-moments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  RotateCcw,
  Sparkles,
  Heart,
  ImageIcon,
} from "lucide-react";

const PRESET_IMAGES = [
  { label: "Pink Bento Cake", path: "/cakes/pink-bento-cake.jpg" },
  { label: "Lavender Pearl Cake", path: "/cakes/lavender-pearl-cake.jpg" },
  { label: "Belgian Truffle Cake", path: "/cakes/belgian-truffle-cake.jpg" },
  { label: "Royal Gold Brownie", path: "/cakes/royal-gold-brownie.jpg" },
  { label: "Biscoff Nut Brownie", path: "/cakes/biscoff-nut-brownie.jpg" },
  { label: "Coral Heart Cake", path: "/cakes/coral-heart-cake.jpg" },
  { label: "Butterfly Lilac Cake", path: "/cakes/butterfly-lilac-cake.jpg" },
  { label: "Artisan Cookies", path: "/products/artisan-cookies.jpg" },
  { label: "Choc Chip Cookies", path: "/products/choc-chip-cookies.jpg" },
];

export function AdminCustomerMoments() {
  const { moments, save, resetDefaults } = useCustomerMoments();
  const [editingMoment, setEditingMoment] = useState<CustomerMoment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<{
    id?: string;
    customer: string;
    occasion: string;
    rating: number;
    note: string;
    image: string;
    isActive: boolean;
  }>({
    customer: "",
    occasion: "",
    rating: 5,
    note: "",
    image: "/cakes/pink-bento-cake.jpg",
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingMoment(null);
    setFormState({
      customer: "",
      occasion: "",
      rating: 5,
      note: "",
      image: "/cakes/pink-bento-cake.jpg",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (moment: CustomerMoment) => {
    setEditingMoment(moment);
    setFormState({ ...moment });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer review?")) {
      const updated = moments.filter((m) => m.id !== id);
      save(updated);
      toast.success("Customer review deleted");
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = moments.map((m) =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    save(updated);
    toast.success("Visibility updated");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormState((prev) => ({ ...prev, image: result }));
        toast.success("Photo uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customer.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formState.note.trim()) {
      toast.error("Review note is required");
      return;
    }
    if (!formState.image) {
      toast.error("An image is required");
      return;
    }

    if (editingMoment) {
      const updated = moments.map((m) =>
        m.id === editingMoment.id ? ({ ...formState, id: editingMoment.id } as CustomerMoment) : m
      );
      save(updated);
      toast.success("Review updated successfully!");
    } else {
      const newMoment: CustomerMoment = {
        ...formState,
        id: `mom-${Date.now()}`,
      };
      save([...moments, newMoment]);
      toast.success("New customer review added!");
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-berry mb-2">
            <Sparkles className="size-3.5" />
            <span>Homepage Reviews Accordion</span>
          </div>
          <h2 className="font-nimbus text-2xl sm:text-3xl font-bold text-cocoa">
            Sweet Moments Reviews Manager
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Edit customer names, reviews, ratings, and uploaded photos displayed in the homepage Accordion Gallery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset to default customer memories?")) {
                resetDefaults();
                toast.success("Reset to defaults");
              }
            }}
            className="rounded-xl border-border text-xs gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl bg-cocoa text-background hover:bg-cocoa/90 text-xs font-bold gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Review Moment</span>
          </Button>
        </div>
      </div>

      {/* Grid of Customer Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className={`rounded-2xl border p-4 bg-card shadow-soft flex flex-col justify-between transition-all duration-200 ${
              moment.isActive ? "border-border" : "border-destructive/30 opacity-60 bg-muted/30"
            }`}
          >
            <div>
              {/* Photo & Active Badge */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-secondary border border-border/50 mb-3">
                <img
                  src={moment.image}
                  alt={moment.customer}
                  className="size-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-full text-amber-400 text-xs">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-black text-[11px] text-amber-300">{moment.rating}/5</span>
                </div>
                {!moment.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                    Hidden from Homepage
                  </div>
                )}
              </div>

              {/* Customer & Occasion */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {moment.occasion || "Bakery Customer"}
                </span>
                <h3 className="font-blogh text-lg text-cocoa leading-tight mt-1">
                  {moment.customer}
                </h3>
                <p className="font-sans text-xs text-foreground/85 italic line-clamp-3 leading-relaxed mt-1">
                  "{moment.note}"
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(moment.id)}
                className={`h-8 rounded-lg text-xs gap-1 cursor-pointer ${
                  moment.isActive ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground"
                }`}
              >
                {moment.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                <span>{moment.isActive ? "Active" : "Hidden"}</span>
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(moment)}
                  className="h-8 rounded-lg text-xs gap-1 cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(moment.id)}
                  className="h-8 text-destructive hover:bg-destructive/10 rounded-lg text-xs cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-nimbus text-2xl font-bold text-cocoa">
              {editingMoment ? "Edit Customer Review" : "Add Customer Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Customize the customer name (in Blogh font), review note (in Inter font), rating, and photo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Customer Name */}
            <div>
              <Label className="text-xs font-bold">Customer Name (Blogh Font)</Label>
              <Input
                value={formState.customer}
                onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                placeholder="e.g. PRIYA & KARTHIK"
                className="mt-1 font-blogh text-base tracking-wide"
                required
              />
            </div>

            {/* Occasion */}
            <div>
              <Label className="text-xs font-bold">Occasion / Event Tag</Label>
              <Input
                value={formState.occasion}
                onChange={(e) => setFormState({ ...formState, occasion: e.target.value })}
                placeholder="e.g. 2nd Anniversary Celebration"
                className="mt-1 text-xs"
              />
            </div>

            {/* Star Rating */}
            <div>
              <Label className="text-xs font-bold">Star Rating (1 - 5)</Label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormState({ ...formState, rating: star })}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`size-6 ${
                        star <= formState.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Note */}
            <div>
              <Label className="text-xs font-bold">Review Note (Inter Font)</Label>
              <Textarea
                value={formState.note}
                onChange={(e) => setFormState({ ...formState, note: e.target.value })}
                placeholder="Write the customer review message..."
                className="mt-1 text-xs leading-relaxed font-sans min-h-[90px]"
                required
              />
            </div>

            {/* Image Selection & Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">Review Photo</Label>
              
              {/* Current Preview */}
              {formState.image && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-secondary border border-border/70">
                  <img
                    src={formState.image}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                </div>
              )}

              {/* Upload Custom Image Button */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs gap-1.5 flex-1 cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>Upload Own Image from Device</span>
                </Button>
              </div>

              {/* Preset Image Options */}
              <div className="pt-2">
                <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                  Or select from bakery presets:
                </span>
                <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto p-1 bg-secondary/30 rounded-xl border">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setFormState({ ...formState, image: preset.path })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        formState.image === preset.path
                          ? "border-amber-500 scale-95 ring-2 ring-amber-500/50"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-cocoa text-background hover:bg-cocoa/90 text-xs font-bold cursor-pointer"
              >
                Save Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCustomerMoments;
