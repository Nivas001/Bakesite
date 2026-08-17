import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, RotateCcw, Play, Loader2, Gift } from "lucide-react";
import type { VoucherReward } from "./voucher-reward-modal";

interface SpinWheelGameProps {
  onWin: (voucher: VoucherReward) => void;
  claimCouponFn: (input: { gameId: string; gameName: string }) => Promise<{
    ok: true;
    code: string;
    discountPercent: number;
    expiresAt: string;
    description?: string | null | undefined;
    gameName: string;
  }>;
}

interface WheelSegment {
  id: number;
  label: string;
  sublabel: string;
  icon: string;
  bg: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { id: 0, label: "15% OFF", sublabel: "Mega Deal", icon: "🍰", bg: "#9e2a2b", textColor: "#ffffff" },
  { id: 1, label: "15% OFF", sublabel: "Dark Truffle", icon: "🍫", bg: "#540b0e", textColor: "#ffffff" },
  { id: 2, label: "15% OFF", sublabel: "Cookie Box", icon: "🍪", bg: "#d97706", textColor: "#ffffff" },
  { id: 3, label: "15% OFF", sublabel: "Strawberry Bliss", icon: "🍓", bg: "#e11d48", textColor: "#ffffff" },
  { id: 4, label: "15% OFF", sublabel: "Mango Treat", icon: "🥭", bg: "#f59e0b", textColor: "#1c1917" },
  { id: 5, label: "15% OFF", sublabel: "Chef's Pass", icon: "✨", bg: "#6b21a8", textColor: "#ffffff" },
  { id: 6, label: "15% OFF", sublabel: "Bento Cake", icon: "🧁", bg: "#db2777", textColor: "#ffffff" },
  { id: 7, label: "15% OFF", sublabel: "Flower Blossom", icon: "🌸", bg: "#059669", textColor: "#ffffff" },
];

export function SpinWheelGame({ onWin, claimCouponFn }: SpinWheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const spinCountRef = useRef(0);

  function handleSpin() {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinningSegment(null);

    // Pick random segment
    const targetSegmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Align target segment under the top pointer (at 270 deg or 0 deg offset)
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = extraSpins + (360 - targetSegmentIndex * segmentAngle - segmentAngle / 2);

    spinCountRef.current += 1;
    const totalRotation = rotationDegrees + targetAngle;
    setRotationDegrees(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = SEGMENTS[targetSegmentIndex]!;
      setWinningSegment(chosen);
    }, 4200);
  }

  async function handleClaimPrize() {
    setIsClaiming(true);
    try {
      const reward = await claimCouponFn({
        gameId: "spin",
        gameName: `Lucky Baker's Wheel (${winningSegment?.sublabel || "15% Prize"})`,
      });
      onWin({
        code: reward.code,
        discountPercent: reward.discountPercent,
        expiresAt: reward.expiresAt,
        description: reward.description ?? undefined,
        gameName: "Lucky Baker's Wheel of Sweets",
      });
    } catch {
      // Fallback
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card p-4 sm:p-7 shadow-soft">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-berry/10 text-berry">
            <Gift className="size-5" />
          </div>
          <div>
            <h3 className="font-blogh text-base sm:text-lg font-bold text-cocoa leading-tight">
              Lucky Baker&apos;s Wheel
            </h3>
            <p className="text-[11px] text-muted-foreground">Spin the confectionery wheel to unlock a guaranteed 15% voucher</p>
          </div>
        </div>

        <div className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          Guaranteed 15% Reward
        </div>
      </div>

      {/* Wheel Arena */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Top Indicator Needle */}
          <div className="absolute -top-3.5 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
            <div className="size-0 border-x-[12px] border-x-transparent border-t-[20px] border-t-amber-400" />
            <div className="size-2 rounded-full bg-amber-500 -mt-1 shadow-sm" />
          </div>

          {/* SVG Wheel (Responsive dimensions) */}
          <div className="relative size-[260px] xs:size-[290px] sm:size-[340px] md:size-[360px] rounded-full p-2.5 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-2xl border-4 border-amber-300/80">
            <div
              className="size-full rounded-full overflow-hidden transition-transform duration-[4200ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" className="size-full">
                {SEGMENTS.map((seg, idx) => {
                  const angle = 360 / SEGMENTS.length;
                  const startAngle = idx * angle;
                  const endAngle = (idx + 1) * angle;

                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;

                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);

                  const midRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180;
                  const textX = 50 + 32 * Math.cos(midRad);
                  const textY = 50 + 32 * Math.sin(midRad);
                  const textAngle = (startAngle + endAngle) / 2;

                  return (
                    <g key={seg.id}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={seg.bg}
                        stroke="#ffffff"
                        strokeWidth="0.75"
                      />
                      <g transform={`rotate(${textAngle}, ${textX}, ${textY})`}>
                        <text
                          x={textX}
                          y={textY - 3}
                          textAnchor="middle"
                          fill={seg.textColor}
                          fontSize="4"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          {seg.label}
                        </text>
                        <text
                          x={textX}
                          y={textY + 3}
                          textAnchor="middle"
                          fill={seg.textColor}
                          fontSize="2.8"
                          fontWeight="600"
                          opacity="0.95"
                          fontFamily="sans-serif"
                        >
                          {seg.icon}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spinning Hub / Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="size-16 sm:size-20 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 border-4 border-white shadow-lift flex flex-col items-center justify-center text-cocoa font-extrabold cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
              >
                <Play className={`size-5 text-cocoa ${isSpinning ? "animate-spin" : "fill-current"}`} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isSpinning ? "SPINNING" : "SPIN!"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Post-Spin Victory Screen */}
        {winningSegment && (
          <div className="mt-6 w-full text-center space-y-4 animate-fadeIn">
            <div className="rounded-2xl bg-matcha/40 border border-matcha p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{winningSegment.icon}</span>
                <span className="font-blogh text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  Landed on: {winningSegment.sublabel} (15% OFF)!
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your guaranteed 1-time 15% confectionery discount code is ready to claim.
              </p>

              <Button
                type="button"
                onClick={handleClaimPrize}
                disabled={isClaiming}
                className="w-full sm:w-auto rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs sm:text-sm h-11 px-8 shadow-lift cursor-pointer"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    <span>Generating Exclusive Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2 text-amber-300" />
                    <span>Claim Your 15% Voucher Code</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!winningSegment && !isSpinning && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Tap the golden <strong className="text-cocoa">SPIN!</strong> button in the center to test your sweet fortune!
          </p>
        )}
      </div>
    </div>
  );
}
