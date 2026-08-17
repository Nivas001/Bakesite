import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, ArrowRight, PartyPopper, ShoppingBag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface VoucherReward {
  code: string;
  discountPercent: number;
  expiresAt: string;
  description?: string | undefined;
  gameName: string;
}

interface VoucherRewardModalProps {
  voucher: VoucherReward | null;
  isOpen: boolean;
  onClose: () => void;
}

const CONFETTI_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
const CONFETTI_COLORS = ["text-berry", "text-amber-500", "text-emerald-500", "text-rose-500", "text-purple-500"];

export function VoucherRewardModal({ voucher, isOpen, onClose }: VoucherRewardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!voucher) return null;

  const formattedExpiry = new Date(voucher.expiresAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function handleCopy() {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Exclusive 15% code "${voucher.code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-berry/30 bg-card shadow-2xl">
        {/* Celebration Header Gradient */}
        <div className="relative bg-gradient-to-br from-berry via-rose-600 to-amber-500 p-6 text-center text-white">
          {/* Decorative Sparkles & Confetti */}
          <div className="flex justify-center mb-2">
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
              <PartyPopper className="size-8 text-amber-200 animate-bounce" />
              {CONFETTI_ANGLES.map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = Math.round(Math.cos(rad) * 38);
                const y = Math.round(Math.sin(rad) * 38);
                return (
                  <span
                    key={angle}
                    className={`absolute size-2 rounded-full ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} bg-current animate-ping`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      animationDuration: "1.5s",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
              <Sparkles className="size-3.5" />
              <span>Challenge Conquered!</span>
            </div>
            <DialogTitle className="font-blogh text-2xl sm:text-3xl text-white tracking-wide">
              YOU WON A 15% VOUCHER!
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-white/90 font-medium">
              Congratulations! You mastered the {voucher.gameName}. Here is your exclusive 1-time discount code.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Voucher Ticket Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Realistic Dashed Bakery Coupon Ticket */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-berry/50 bg-secondary/50 p-4 sm:p-5 shadow-soft">
            {/* Left and right notch cutouts */}
            <div aria-hidden className="absolute -left-3.5 top-1/2 -translate-y-1/2 size-6 rounded-full bg-card border-r-2 border-berry/50" />
            <div aria-hidden className="absolute -right-3.5 top-1/2 -translate-y-1/2 size-6 rounded-full bg-card border-l-2 border-berry/50" />

            <div className="flex items-center justify-between gap-2 border-b border-dashed border-border/70 pb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-berry">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Verified 1-Time Single Use</span>
              </div>
              <span className="rounded-full bg-berry px-2.5 py-0.5 text-xs font-bold text-berry-foreground shadow-2xs">
                {voucher.discountPercent}% OFF
              </span>
            </div>

            {/* Big Prominent Voucher Code */}
            <div className="my-4 text-center">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Your Exclusive Promo Code</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-black text-cocoa tracking-wider select-all bg-card px-4 py-1.5 rounded-xl border border-berry/30 shadow-inner">
                  {voucher.code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-dashed border-border/70">
              <span>Valid on orders above ₹200</span>
              <span className="font-semibold text-cocoa">Expires: {formattedExpiry}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className={`h-11 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                  : "border-border hover:border-berry text-cocoa"
              }`}
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-500 mr-1.5" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-1.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>

            <Button
              asChild
              className="h-11 rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs sm:text-sm shadow-lift cursor-pointer"
            >
              <Link to="/shop" onClick={onClose}>
                <ShoppingBag className="size-4 mr-1.5" />
                <span>Shop Bakes Now</span>
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/80 leading-snug">
            💡 This code can only be used once at checkout. Keep it safe or apply it directly on your fresh order!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
