import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { claimGameRewardCoupon } from "@/lib/offers.functions";
import { QuizGame } from "@/components/games/quiz-game";
import { MemoryGame } from "@/components/games/memory-game";
import { SpinWheelGame } from "@/components/games/spin-wheel-game";
import { VoucherRewardModal, type VoucherReward } from "@/components/games/voucher-reward-modal";
import { Button } from "@/components/ui/button";
import { Sparkles, Gamepad2, HelpCircle, Layers, Gift, ArrowRight, Tag, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/play-coupons")({
  head: () => ({
    meta: [
      { title: "Play & Win Bakery Coupons — Ani Bakes Bakery" },
      {
        name: "description",
        content: "Play our confectionery trivia, memory match, or spin the wheel to win a single-use 15% discount coupon at Ani Bakes.",
      },
      { property: "og:title", content: "Play & Win Bakery Coupons — Ani Bakes Bakery" },
      {
        property: "og:description",
        content: "Play bakery mini-games and win exclusive 15% off promo codes at Ani Bakes.",
      },
    ],
  }),
  component: PlayCouponsPage,
});

type GameTab = "quiz" | "memory" | "spin";

function PlayCouponsPage() {
  const [activeTab, setActiveTab] = useState<GameTab>("quiz");
  const [claimedVoucher, setClaimedVoucher] = useState<VoucherReward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const executeClaimCoupon = useServerFn(claimGameRewardCoupon);

  async function handleClaimCoupon(input: { gameId: string; gameName: string }) {
    return executeClaimCoupon({ data: input });
  }

  function handleGameWin(voucher: VoucherReward) {
    setClaimedVoucher(voucher);
    setIsModalOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* 1. Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6 sm:pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-berry/15 text-berry">
              <Gamepad2 className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-berry">
              Ani&apos;s Confectionery Arcade
            </span>
          </div>

          <h1 className="font-blogh text-3xl sm:text-5xl font-bold text-cocoa leading-tight tracking-wide">
            Play & Win Bakery Coupons
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Test your craft knowledge, challenge your memory, or spin the sweets wheel. Conquer any game to unlock an exclusive <strong className="text-cocoa">15% single-use discount voucher</strong> for your next artisan order!
          </p>
        </div>

        {/* Quick Perks Pill */}
        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/90 px-3.5 py-1.5 text-xs font-semibold text-cocoa border border-border/60 shadow-2xs">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>1-Time Single-Use Vouchers</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-berry/10 px-3.5 py-1.5 text-xs font-bold text-berry border border-berry/20 shadow-2xs">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>15% Flat Discount</span>
          </div>
        </div>
      </div>

      {/* 2. Responsive Game Selector Navigation */}
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-xl rounded-2xl bg-secondary/80 p-1.5 border border-border/70 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "quiz"
                ? "bg-card text-cocoa shadow-soft scale-[1.02] border border-border/80"
                : "text-muted-foreground hover:text-cocoa hover:bg-card/40"
            }`}
          >
            <HelpCircle className={`size-4 ${activeTab === "quiz" ? "text-berry" : "text-muted-foreground"}`} />
            <span>Trivia Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("memory")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "memory"
                ? "bg-card text-cocoa shadow-soft scale-[1.02] border border-border/80"
                : "text-muted-foreground hover:text-cocoa hover:bg-card/40"
            }`}
          >
            <Layers className={`size-4 ${activeTab === "memory" ? "text-berry" : "text-muted-foreground"}`} />
            <span>Memory Match</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spin")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "spin"
                ? "bg-card text-cocoa shadow-soft scale-[1.02] border border-border/80"
                : "text-muted-foreground hover:text-cocoa hover:bg-card/40"
            }`}
          >
            <Gift className={`size-4 ${activeTab === "spin" ? "text-amber-500" : "text-muted-foreground"}`} />
            <span>Wheel of Sweets</span>
          </button>
        </div>
      </div>

      {/* 3. Active Game Container */}
      <div className="transition-all duration-300">
        {activeTab === "quiz" && (
          <QuizGame onWin={handleGameWin} claimCouponFn={handleClaimCoupon} />
        )}
        {activeTab === "memory" && (
          <MemoryGame onWin={handleGameWin} claimCouponFn={handleClaimCoupon} />
        )}
        {activeTab === "spin" && (
          <SpinWheelGame onWin={handleGameWin} claimCouponFn={handleClaimCoupon} />
        )}
      </div>

      {/* 4. Footer Links and Explanations */}
      <div className="rounded-3xl border border-border/70 bg-secondary/40 p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <Tag className="size-4 text-berry" />
            <h4 className="font-blogh text-base sm:text-lg font-bold text-cocoa uppercase tracking-wide">
              Already have a coupon code?
            </h4>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            Check our active weekly bakery offers or head straight to checkout to apply your code.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9">
            <Link to="/offers">
              <span>View Offers Page</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>

          <Button asChild size="sm" className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs h-9 shadow-soft">
            <Link to="/shop">
              <span>Shop Bakery Counter</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 5. Winner Voucher Celebration Modal */}
      <VoucherRewardModal
        voucher={claimedVoucher}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
