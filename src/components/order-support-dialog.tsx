import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  HelpCircle,
  MessageCircle,
  AlertCircle,
  PackageX,
  PhoneCall,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reportOrderIssue } from "@/lib/orders.functions";
import type { OrderRecord } from "@/routes/orders";
import { formatSlotDate, slotLabelFor } from "@/lib/slots";

interface OrderSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder?: OrderRecord | null;
  orders?: OrderRecord[];
}

export function OrderSupportDialog({
  open,
  onOpenChange,
  selectedOrder,
  orders = [],
}: OrderSupportDialogProps) {
  const [activeTab, setActiveTab] = useState<"help" | "report">(
    selectedOrder ? "report" : "help"
  );
  const [targetOrderId, setTargetOrderId] = useState<string>(
    selectedOrder?.id ?? (orders.length > 0 ? orders[0]!.id : "")
  );
  const [category, setCategory] = useState<
    "damaged_packaging" | "missing_items" | "wrong_items" | "taste_freshness" | "delivery_delay" | "other"
  >("damaged_packaging");
  const [description, setDescription] = useState("");
  const [preferredResolution, setPreferredResolution] = useState<
    "refund" | "replacement_batch" | "callback_support"
  >("refund");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportResult, setReportResult] = useState<{
    whatsappUrl: string;
    message: string;
  } | null>(null);

  const reportIssueFn = useServerFn(reportOrderIssue);

  // If selectedOrder changes when opening dialog, update tab & target
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (selectedOrder) {
        setActiveTab("report");
        setTargetOrderId(selectedOrder.id);
      }
      setReportResult(null);
      setDescription("");
    }
    onOpenChange(isOpen);
  };

  const currentOrder =
    selectedOrder || orders.find((o) => o.id === targetOrderId) || null;

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!targetOrderId) {
      toast.error("Please select an order to report.");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Please write a few words explaining the issue.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reportIssueFn({
        data: {
          orderId: targetOrderId,
          category,
          description: description.trim(),
          preferredResolution,
        },
      });

      setReportResult({
        whatsappUrl: res.whatsappUrl,
        message: res.message,
      });
      toast.success("Problem report submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report. Please try WhatsApp helpline.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const directHelplineUrl = encodeURIComponent(
    `Hi Ani Bakes Studio! 🥐 I need some help and support regarding my orders.`
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6 border-border/80 bg-card shadow-lift overflow-hidden">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-berry/15 text-berry border border-berry/30">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-blogh uppercase tracking-wide text-xl text-cocoa">
                Bakery Care & Support
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Small-batch quality assurance & prompt customer assistance
              </DialogDescription>
            </div>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border/60 mt-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("help");
                setReportResult(null);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "help"
                  ? "bg-cocoa text-background shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Helpline & FAQs
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("report");
                setReportResult(null);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "report"
                  ? "bg-cocoa text-background shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Report Order Issue
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Helpline & Quick FAQs */}
        {activeTab === "help" && (
          <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* WhatsApp 1-Click Helpline Banner */}
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <MessageCircle className="size-4 text-emerald-500" />
                  Direct Baker Hotline
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Instant Reply
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Have an urgent delivery inquiry, address change, or cake customization query? Message head baker directly on WhatsApp.
              </p>
              <Button
                asChild
                size="sm"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-xs"
              >
                <a
                  href={`https://wa.me/917448724920?text=${directHelplineUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Chat on WhatsApp (+91 74487 24920)</span>
                </a>
              </Button>
            </div>

            {/* Quick Policy Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-secondary/40 p-3 border border-border/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cocoa">
                  <Clock className="size-3.5 text-amber-500" />
                  <span>Morning Slots</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bakes come out of oven at 4:00 AM and arrive fresh within your chosen delivery window.
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/40 p-3 border border-border/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cocoa">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  <span>Rescheduled Slot Policy</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  If we ever reschedule your slot, you can reject the slot for an instant 100% full refund.
                </p>
              </div>
            </div>

            {/* Common Questions Accordion-Style Cards */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground">
                Help Topics
              </p>
              <div className="rounded-2xl bg-card border border-border/70 p-3 text-xs space-y-1">
                <p className="font-bold text-foreground">How should I store my pastries & cakes?</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Refrigerate cream cakes at 4°C–8°C. Sourdoughs and cookies stay best in an airtight container at cool room temperature.
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border/70 p-3 text-xs space-y-1">
                <p className="font-bold text-foreground">What if my delivery arrives damaged?</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Click the <strong>'Report Order Issue'</strong> tab to report any damaged packaging or missing items for instant replacement or refund.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Report an Issue on a Completed/Delivered Order */}
        {activeTab === "report" && (
          <div className="pt-2 max-h-[60vh] overflow-y-auto pr-1">
            {reportResult ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="font-blogh uppercase tracking-wide text-lg text-cocoa">
                  Issue Report Received
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {reportResult.message}
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-xs"
                  >
                    <a
                      href={reportResult.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Escalate via WhatsApp for Instant Resolution</span>
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReportResult(null);
                      setDescription("");
                      onOpenChange(false);
                    }}
                    className="rounded-xl text-xs"
                  >
                    Done & Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                {/* Order Selector (if not pre-locked) */}
                {orders.length > 1 && !selectedOrder && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Select Order to Report:
                    </label>
                    <select
                      value={targetOrderId}
                      onChange={(e) => setTargetOrderId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-cocoa"
                    >
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          #{o.id.slice(-6).toUpperCase()} · {formatSlotDate(o.slot_date)} ({o.order_items.map((i) => i.product_name).join(", ").slice(0, 30)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected Order Summary Banner */}
                {currentOrder && (
                  <div className="rounded-2xl bg-secondary/50 p-3 border border-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-cocoa block">
                        Order #{currentOrder.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatSlotDate(currentOrder.slot_date)} · {slotLabelFor(currentOrder.slot_start)}
                      </span>
                    </div>
                    <span className="rounded-full bg-card px-2.5 py-0.5 text-[10px] font-bold border border-border/60">
                      {currentOrder.order_items.length} item(s)
                    </span>
                  </div>
                )}

                {/* Issue Category Radio/Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground block">
                    What went wrong with this order?
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "damaged_packaging", label: "📦 Damaged Packaging" },
                      { id: "missing_items", label: "🔍 Missing Items" },
                      { id: "wrong_items", label: "❌ Wrong Items" },
                      { id: "taste_freshness", label: "🍓 Taste / Freshness" },
                      { id: "delivery_delay", label: "⏰ Delivery Delay" },
                      { id: "other", label: "💬 Other Concern" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`rounded-xl border p-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                          category === cat.id
                            ? "border-berry bg-berry/10 text-berry shadow-2xs font-bold"
                            : "border-border/60 bg-card hover:bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Description Textarea */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground block">
                    Please describe the problem:
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="E.g., The cake frosting smudged on the lid, or one chocolate croissant was missing from the box."
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-cocoa"
                    required
                  />
                </div>

                {/* Preferred Resolution */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground block">
                    Preferred Resolution:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "refund", label: "💳 Full/Partial Refund" },
                      { id: "replacement_batch", label: "🥐 Fresh Re-bake" },
                      { id: "callback_support", label: "📞 Baker Call" },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setPreferredResolution(res.id as any)}
                        className={`rounded-xl border p-1.5 text-center text-[10.5px] font-semibold transition-all cursor-pointer ${
                          preferredResolution === res.id
                            ? "border-cocoa bg-cocoa text-background font-bold shadow-2xs"
                            : "border-border/60 bg-card text-muted-foreground hover:bg-secondary/40"
                        }`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs h-10 shadow-lift cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Submitting Problem Report…</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>Submit Issue & Connect With Baker</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OrderSupportDialog;
