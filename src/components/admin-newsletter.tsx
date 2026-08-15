import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildNewsletterHtml,
  CAMPAIGN_PRESETS,
  type NewsletterTemplateInput,
} from "@/lib/newsletter-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/pricing";
import {
  Send,
  Eye,
  Paperclip,
  Trash2,
  FileText,
  Smartphone,
  Monitor,
  Sparkles,
  Link as LinkIcon,
  Cake,
  LayoutGrid,
  Rows3,
} from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  is_subscribed: boolean;
  created_at: string;
};

type Campaign = {
  id: string;
  subject: string;
  body: string;
  recipients: number;
  sent_at: string;
};

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

type Props = {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  products?: ProductOption[];
  onSend: (data: {
    subject: string;
    body: string;
    campaign_type?: "announcement" | "weekly_special" | "promotion";
    cta_label?: string | null;
    cta_url?: string | null;
    attachment_b64?: string | null;
    attachment_name?: string | null;
    attachment_mime?: string | null;
    showcase_enabled?: boolean;
    showcase_image?: string | null;
    showcase_title?: string | null;
    showcase_tag?: string | null;
    showcase_description?: string | null;
    showcase_layout?: "side_by_side" | "stacked";
    showcase_link?: string | null;
  }) => Promise<void>;
};

export function AdminNewsletter({ subscribers, campaigns, products = [], onSend }: Props) {
  const [campaignType, setCampaignType] = useState<"announcement" | "weekly_special" | "promotion">("announcement");
  const [subject, setSubject] = useState<string>(CAMPAIGN_PRESETS.announcement.defaultSubject);
  const [bodyText, setBodyText] = useState<string>(CAMPAIGN_PRESETS.announcement.defaultBody);
  const [ctaLabel, setCtaLabel] = useState<string>(CAMPAIGN_PRESETS.announcement.defaultCtaLabel);
  const [ctaUrl, setCtaUrl] = useState<string>(CAMPAIGN_PRESETS.announcement.defaultCtaUrl);
  const [enableCta, setEnableCta] = useState(true);

  // Showcase state (Introducing a new cake / featured bake)
  const [showcaseEnabled, setShowcaseEnabled] = useState(false);
  const [showcaseImage, setShowcaseImage] = useState("");
  const [showcaseTitle, setShowcaseTitle] = useState("");
  const [showcaseTag, setShowcaseTag] = useState("New Launch · Fresh Bake");
  const [showcaseDesc, setShowcaseDesc] = useState("");
  const [showcaseLayout, setShowcaseLayout] = useState<"side_by_side" | "stacked">("side_by_side");
  const [showcaseLink, setShowcaseLink] = useState("https://anibakes.app/shop");

  // Attachment state
  const [attachmentB64, setAttachmentB64] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentMime, setAttachmentMime] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);

  const activeSubscribers = subscribers.filter((s) => s.is_subscribed);

  function handleSelectType(type: "announcement" | "weekly_special" | "promotion") {
    setCampaignType(type);
    const preset = CAMPAIGN_PRESETS[type];
    setSubject(preset.defaultSubject);
    setBodyText(preset.defaultBody);
    setCtaLabel(preset.defaultCtaLabel);
    setCtaUrl(preset.defaultCtaUrl);
  }

  function handleSelectProduct(productId: string) {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    setShowcaseEnabled(true);
    setShowcaseTitle(p.name);
    setShowcaseTag(`${formatCurrency(Number(p.price))} · Fresh Bake`);
    setShowcaseDesc(p.description || "Baked with pure butter and premium ingredients the morning of your chosen slot.");
    setShowcaseImage(p.image_url || "/products/croissant.jpg");
    setShowcaseLink(`https://anibakes.app/product/${p.slug}`);
    toast.success(`Loaded "${p.name}" into showcase!`);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      const b64 = commaIndex !== -1 ? result.slice(commaIndex + 1) : result;

      setAttachmentB64(b64);
      setAttachmentName(file.name);
      setAttachmentMime(file.type || "application/octet-stream");
      setAttachmentSize(file.size);

      // If user enabled showcase and has no image, also populate showcase image
      if (file.type.startsWith("image/") && (!showcaseImage || !showcaseEnabled)) {
        setShowcaseImage(`data:${file.type};base64,${b64}`);
      }

      toast.success(`Attached ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAttachment() {
    setAttachmentB64(null);
    setAttachmentName(null);
    setAttachmentMime(null);
    setAttachmentSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Attachment removed");
  }

  const previewHtml = useMemo(() => {
    const input: NewsletterTemplateInput = {
      subject,
      body: bodyText,
      campaign_type: campaignType,
      cta_label: enableCta ? ctaLabel : null,
      cta_url: enableCta ? ctaUrl : null,
      attachment_b64: attachmentB64,
      attachment_name: attachmentName,
      attachment_mime: attachmentMime,
      showcase_enabled: showcaseEnabled,
      showcase_image: showcaseImage,
      showcase_title: showcaseTitle,
      showcase_tag: showcaseTag,
      showcase_description: showcaseDesc,
      showcase_layout: showcaseLayout,
      showcase_link: showcaseLink,
    };
    return buildNewsletterHtml(input);
  }, [
    subject,
    bodyText,
    campaignType,
    enableCta,
    ctaLabel,
    ctaUrl,
    attachmentB64,
    attachmentName,
    attachmentMime,
    showcaseEnabled,
    showcaseImage,
    showcaseTitle,
    showcaseTag,
    showcaseDesc,
    showcaseLayout,
    showcaseLink,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Please add a campaign subject");
      return;
    }
    if (!bodyText.trim()) {
      toast.error("Please add campaign message content");
      return;
    }

    if (activeSubscribers.length === 0) {
      toast.error("No active subscribers to send to.");
      return;
    }

    setBusy(true);
    try {
      await onSend({
        subject: subject.trim(),
        body: bodyText.trim(),
        campaign_type: campaignType,
        cta_label: enableCta && ctaLabel ? ctaLabel.trim() : null,
        cta_url: enableCta && ctaUrl ? ctaUrl.trim() : null,
        attachment_b64: attachmentB64,
        attachment_name: attachmentName,
        attachment_mime: attachmentMime,
        showcase_enabled: showcaseEnabled,
        showcase_image: showcaseEnabled ? showcaseImage.trim() : null,
        showcase_title: showcaseEnabled ? showcaseTitle.trim() : null,
        showcase_tag: showcaseEnabled ? showcaseTag.trim() : null,
        showcase_description: showcaseEnabled ? showcaseDesc.trim() : null,
        showcase_layout: showcaseLayout,
        showcase_link: showcaseEnabled ? showcaseLink.trim() : null,
      });

      toast.success(`Newsletter dispatched to ${activeSubscribers.length} subscriber(s)!`);
      handleSelectType("announcement");
      handleRemoveAttachment();
      setShowcaseEnabled(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send newsletter");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 2-Column Responsive Layout: Compose on Left, Live Preview on Right */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Form: Compose Card (6 cols) */}
        <div className="lg:col-span-6 xl:col-span-6 rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-soft space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-cocoa">Compose Campaign</h2>
              <span className="rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-semibold text-berry">
                {activeSubscribers.length} Recipient{activeSubscribers.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Branded email formatted in Playfair Display & Inter with custom Ani Bakes header, footer, product showcase, and attachment support.
            </p>
          </div>

          {/* 1. Campaign Preset Selector */}
          <div>
            <Label className="text-xs font-semibold text-cocoa mb-2 block">
              1. Choose Campaign Template
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["announcement", "📣 Announcement"],
                  ["weekly_special", "🎂 Weekend Special"],
                  ["promotion", "🎟 Promo Offer"],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    campaignType === type
                      ? "border-berry bg-berry/10 text-berry shadow-2xs scale-[1.02]"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2. Subject */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="camp-subject" className="text-xs font-semibold">
                  2. Subject Line (Playfair Display)
                </Label>
                <span className="text-[10px] text-muted-foreground">{subject.length}/160</span>
              </div>
              <Input
                id="camp-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Introducing Our Signature Strawberry Velvet Layer Cake"
                required
                maxLength={160}
                className="h-10 rounded-xl text-xs font-medium"
              />
            </div>

            {/* 3. Body Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="camp-body" className="text-xs font-semibold">
                  3. Email Message (Inter)
                </Label>
                <span className="text-[10px] text-muted-foreground">Line breaks format into paragraphs</span>
              </div>
              <Textarea
                id="camp-body"
                rows={6}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your email introduction or announcement here..."
                required
                className="rounded-xl text-xs leading-relaxed resize-y"
              />
            </div>

            {/* 4. Featured Cake / Bake Showcase Block */}
            <div className="rounded-2xl border border-berry/30 bg-berry/5 p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cake className="size-4 text-berry" />
                  <div>
                    <Label htmlFor="enable-showcase" className="text-xs font-bold text-cocoa cursor-pointer">
                      Feature a Cake / Bake in this Email
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Showcase a photo with title, price/badge, and details on the right or below
                    </p>
                  </div>
                </div>
                <input
                  id="enable-showcase"
                  type="checkbox"
                  checked={showcaseEnabled}
                  onChange={(e) => setShowcaseEnabled(e.target.checked)}
                  className="size-4.5 accent-berry rounded cursor-pointer"
                />
              </div>

              {showcaseEnabled && (
                <div className="space-y-3 pt-2 border-t border-berry/20">
                  {/* Quick-fill from bakery products */}
                  {products.length > 0 && (
                    <div>
                      <Label className="text-[11px] font-semibold text-cocoa block mb-1">
                        ✨ Quick-Fill From Existing Products:
                      </Label>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleSelectProduct(e.target.value);
                        }}
                        className="h-8.5 w-full rounded-xl border border-border/80 bg-card px-2.5 text-xs text-foreground cursor-pointer focus:ring-1 focus:ring-berry"
                      >
                        <option value="" disabled>
                          -- Pick a bakery cake / product to auto-fill --
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(Number(p.price))})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Layout Option: Side-by-side vs Stacked */}
                  <div>
                    <Label className="text-[11px] font-semibold text-cocoa block mb-1.5">
                      Showcase Photo Layout:
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowcaseLayout("side_by_side")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          showcaseLayout === "side_by_side"
                            ? "border-berry bg-card text-berry shadow-2xs"
                            : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                        }`}
                      >
                        <LayoutGrid className="size-3.5" />
                        <span>Side by Side (Details Right)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowcaseLayout("stacked")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          showcaseLayout === "stacked"
                            ? "border-berry bg-card text-berry shadow-2xs"
                            : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                        }`}
                      >
                        <Rows3 className="size-3.5" />
                        <span>Stacked (Details Down)</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <Label htmlFor="sc-title" className="text-[11px] text-muted-foreground block mb-1">
                        Cake / Bake Name
                      </Label>
                      <Input
                        id="sc-title"
                        value={showcaseTitle}
                        onChange={(e) => setShowcaseTitle(e.target.value)}
                        placeholder="e.g. Raspberry Basque Cheesecake"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sc-tag" className="text-[11px] text-muted-foreground block mb-1">
                        Price / Badge Tag
                      </Label>
                      <Input
                        id="sc-tag"
                        value={showcaseTag}
                        onChange={(e) => setShowcaseTag(e.target.value)}
                        placeholder="e.g. ₹650 · New Launch"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div>
                    <Label htmlFor="sc-img" className="text-[11px] text-muted-foreground block mb-1">
                      Cake Photo URL (or /products/filename.jpg)
                    </Label>
                    <Input
                      id="sc-img"
                      value={showcaseImage}
                      onChange={(e) => setShowcaseImage(e.target.value)}
                      placeholder="https://... or /products/croissant.jpg"
                      className="h-8 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="sc-desc" className="text-[11px] text-muted-foreground block mb-1">
                      Cake Description & Flavor Notes
                    </Label>
                    <Textarea
                      id="sc-desc"
                      rows={2}
                      value={showcaseDesc}
                      onChange={(e) => setShowcaseDesc(e.target.value)}
                      placeholder="e.g. Three layers of fluffy vanilla sponge infused with fresh local farm strawberries and cream cheese frosting."
                      className="rounded-lg text-xs resize-none"
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <Label htmlFor="sc-link" className="text-[11px] text-muted-foreground block mb-1">
                      Order Link URL
                    </Label>
                    <Input
                      id="sc-link"
                      value={showcaseLink}
                      onChange={(e) => setShowcaseLink(e.target.value)}
                      placeholder="https://anibakes.app/shop"
                      className="h-8 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Call-to-Action (CTA) Button */}
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-3.5 text-berry" />
                  <Label htmlFor="enable-cta" className="text-xs font-semibold cursor-pointer">
                    Include Bottom Action Button (CTA)
                  </Label>
                </div>
                <input
                  id="enable-cta"
                  type="checkbox"
                  checked={enableCta}
                  onChange={(e) => setEnableCta(e.target.checked)}
                  className="size-4 accent-berry rounded cursor-pointer"
                />
              </div>

              {enableCta && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <Label htmlFor="cta-label" className="text-[11px] text-muted-foreground block mb-1">
                      Button Text
                    </Label>
                    <Input
                      id="cta-label"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="e.g. Order This Week's Bakes →"
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-url" className="text-[11px] text-muted-foreground block mb-1">
                      Button Link URL
                    </Label>
                    <Input
                      id="cta-url"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-8 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Attachment Section */}
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-3.5 text-cocoa" />
                  <span className="text-xs font-semibold">Attach Image or PDF Document</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Max 5 MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="newsletter-attachment"
              />

              {!attachmentB64 ? (
                <label
                  htmlFor="newsletter-attachment"
                  className="flex items-center justify-center gap-2 border border-dashed border-border/80 hover:border-berry/60 bg-card rounded-xl p-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                >
                  <Paperclip className="size-3.5" />
                  <span>Click to choose Image (Banner) or PDF Menu</span>
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-card border border-border/70 p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {attachmentMime?.startsWith("image/") ? (
                      <img
                        src={`data:${attachmentMime};base64,${attachmentB64}`}
                        alt="Preview"
                        className="size-8 rounded-lg object-cover border shrink-0"
                      />
                    ) : (
                      <div className="size-8 rounded-lg bg-berry/10 text-berry flex items-center justify-center shrink-0">
                        <FileText className="size-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{attachmentName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(attachmentSize / 1024).toFixed(1)} KB ·{" "}
                        {attachmentMime?.startsWith("image/") ? "Inline Email Banner" : "File Attachment"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAttachment}
                    className="size-7 p-0 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs shadow-soft transition-all active:scale-98 cursor-pointer mt-2"
            >
              <Send className="mr-2 size-4" />
              {busy ? "Dispatching Newsletter…" : `Send to ${activeSubscribers.length} Subscriber${activeSubscribers.length === 1 ? "" : "s"}`}
            </Button>
          </form>
        </div>

        {/* Right Form: Live Interactive Email Preview (6 cols) */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-berry" />
              <h3 className="font-display text-sm sm:text-base font-bold text-cocoa">
                Live Email Preview
              </h3>
            </div>

            {/* Desktop / Mobile Device View Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-secondary/80 p-0.5 border border-border/60">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-card text-cocoa shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="size-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-card text-cocoa shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="size-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Iframe Preview Wrapper */}
          <div className="flex justify-center bg-secondary/40 rounded-3xl border border-border/70 p-3 sm:p-5 shadow-inner">
            <div
              className={`transition-all duration-300 overflow-hidden rounded-2xl shadow-lift border border-border/80 bg-white ${
                previewDevice === "mobile" ? "w-[360px]" : "w-full"
              }`}
              style={{ height: "660px" }}
            >
              <iframe
                title="Email Campaign Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Campaign History & Subscriber Count Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Sent Campaigns */}
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <h3 className="font-display text-base font-bold text-cocoa mb-3">Recently Dispatched Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className="text-xs text-muted-foreground">No campaigns sent yet.</p>
          ) : (
            <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/50 p-2.5 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-foreground truncate">{c.subject}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(c.sent_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                    {c.recipients} sent
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Subscribers List */}
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-cocoa">Subscribers Roster</h3>
            <span className="text-xs text-muted-foreground">{subscribers.length} total</span>
          </div>
          {subscribers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No subscribers yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {subscribers.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-secondary/30 transition-colors"
                >
                  <span className="font-mono text-[11px] truncate text-foreground/90">{s.email}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      s.is_subscribed
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.is_subscribed ? "Active" : "Unsubscribed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
