import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, RotateCcw, Timer, Layers, Loader2 } from "lucide-react";
import type { VoucherReward } from "./voucher-reward-modal";

interface MemoryGameProps {
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

interface MemoryCard {
  id: number;
  pairId: number;
  name: string;
  emoji: string;
  image?: string;
  bgGradient: string;
}

const CARD_PAIRS = [
  { pairId: 1, name: "Bento Cake", emoji: "🍰", image: "/hero/hero-cake-real.png", bgGradient: "from-pink-500/20 to-rose-500/30" },
  { pairId: 2, name: "Dark Truffle", emoji: "🍫", image: "/hero/hero-3d-dark-truffle.jpg", bgGradient: "from-amber-700/20 to-amber-900/30" },
  { pairId: 3, name: "Chunky Cookie", emoji: "🍪", image: "/hero/hero-3d-cookie.jpg", bgGradient: "from-amber-500/20 to-orange-500/30" },
  { pairId: 4, name: "French Strawberry", emoji: "🍓", image: "/hero/hero-3d-cake.jpg", bgGradient: "from-rose-500/20 to-red-500/30" },
  { pairId: 5, name: "Mango Gateau", emoji: "🥭", bgGradient: "from-amber-400/20 to-yellow-500/30" },
  { pairId: 6, name: "Buttercream Blossom", emoji: "🌸", bgGradient: "from-purple-400/20 to-pink-500/30" },
];

function shuffleCards(): MemoryCard[] {
  const cards: MemoryCard[] = [];
  let idCounter = 1;
  for (const pair of CARD_PAIRS) {
    cards.push({ id: idCounter++, ...pair });
    cards.push({ id: idCounter++, ...pair });
  }
  // Fisher-Yates Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = cards[i]!;
    cards[i] = cards[j]!;
    cards[j] = temp;
  }
  return cards;
}

export function MemoryGame({ onWin, claimCouponFn }: MemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(65);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const initGame = useCallback(() => {
    setCards(shuffleCards());
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setTimeLeft(65);
    setIsGameOver(false);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Countdown timer
  useEffect(() => {
    if (isGameOver || isWon || cards.length === 0) return;
    if (timeLeft <= 0) {
      setIsGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, isWon, cards.length]);

  function handleCardClick(index: number) {
    if (
      isGameOver ||
      isWon ||
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairIds.includes(cards[index]!.pairId)
    ) {
      return;
    }

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = cards[firstIdx!]!;
      const secondCard = cards[secondIdx!]!;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        const nextMatched = [...matchedPairIds, firstCard.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === CARD_PAIRS.length) {
          setIsWon(true);
          setIsGameOver(true);
        }
      } else {
        // Unmatched, flip back after brief pause
        setTimeout(() => {
          setFlippedIndices([]);
        }, 850);
      }
    }
  }

  async function handleClaimPrize() {
    setIsClaiming(true);
    try {
      const reward = await claimCouponFn({
        gameId: "memory",
        gameName: "Pastry Memory Match Atelier",
      });
      onWin({
        code: reward.code,
        discountPercent: reward.discountPercent,
        expiresAt: reward.expiresAt,
        description: reward.description ?? undefined,
        gameName: "Pastry Memory Match Atelier",
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
            <Layers className="size-5" />
          </div>
          <div>
            <h3 className="font-blogh text-base sm:text-lg font-bold text-cocoa leading-tight">
              Pastry Memory Match
            </h3>
            <p className="text-[11px] text-muted-foreground">Match all 6 pairs before time expires to win</p>
          </div>
        </div>

        {/* Timer & Pairs Pill */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            timeLeft < 15 ? "bg-rose-500/15 text-rose-600 animate-pulse" : "bg-secondary text-cocoa"
          }`}>
            <Timer className="size-3.5" />
            <span>{timeLeft}s</span>
          </div>

          <div className="rounded-full bg-berry/15 px-3 py-1 text-xs font-bold text-berry">
            Pairs: {matchedPairIds.length}/{CARD_PAIRS.length}
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="mt-5 space-y-4">
          {/* Card Grid (3 cols on mobile, 4 cols on sm+) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedPairIds.includes(card.pairId);
              const isMatched = matchedPairIds.includes(card.pairId);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  disabled={isMatched}
                  className={`group relative h-24 sm:h-28 rounded-2xl p-1 text-center transition-all duration-300 transform-gpu cursor-pointer select-none ${
                    isMatched
                      ? "opacity-75 scale-95 border-2 border-emerald-500/60"
                      : "hover:-translate-y-0.5 hover:shadow-soft"
                  }`}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className={`relative w-full h-full rounded-xl transition-transform duration-500 transform-style-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front of Card (Hidden Face / Bakery Pattern) */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-berry/30 bg-gradient-to-br from-secondary via-card to-secondary/80 backface-hidden shadow-inner ${
                        !isFlipped ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl opacity-80 group-hover:scale-110 transition-transform">
                        🧁
                      </span>
                      <span className="mt-1 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        ANI BAKES
                      </span>
                    </div>

                    {/* Back of Card (Revealed Pastry) */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-to-br ${card.bgGradient} p-1 backface-hidden rotate-y-180 shadow-md ${
                        isFlipped ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.name}
                          className="size-11 sm:size-14 rounded-lg object-cover shadow-2xs"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl">{card.emoji}</span>
                      )}
                      <span className="mt-1 font-sans text-[10px] sm:text-xs font-bold text-cocoa truncate max-w-[90%]">
                        {card.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Moves: <strong className="text-cocoa">{moves}</strong></span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={initGame}
              className="h-7 text-xs text-muted-foreground hover:text-berry"
            >
              <RotateCcw className="size-3 mr-1" /> Reset Grid
            </Button>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="mt-6 text-center space-y-5">
          <div className="flex justify-center">
            <div className={`flex size-16 items-center justify-center rounded-3xl ${
              isWon ? "bg-amber-500/20 text-amber-500" : "bg-rose-500/20 text-rose-500"
            }`}>
              <Trophy className="size-9 animate-bounce" />
            </div>
          </div>

          <div>
            <h4 className="font-blogh text-2xl sm:text-3xl font-bold text-cocoa">
              {isWon ? "MEMORY ATELIER MASTERED!" : "TIME RAN OUT, BAKER!"}
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {isWon
                ? `You cleared all 6 pairs in only ${moves} moves with ${timeLeft}s remaining!`
                : `You found ${matchedPairIds.length} out of 6 pairs before the clock stopped.`}
            </p>
          </div>

          {isWon ? (
            <div className="rounded-2xl bg-matcha/40 border border-matcha p-4 space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="size-4 text-emerald-600" />
                <span>You unlocked the 15% Single-Use Bakery Voucher!</span>
              </div>
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
          ) : (
            <div className="rounded-2xl bg-secondary/80 border border-border/70 p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Beat the 65s timer to claim your exclusive 15% discount. Give it another try!
              </p>
              <Button
                type="button"
                onClick={initGame}
                variant="outline"
                className="rounded-xl font-bold text-xs border-border hover:border-berry text-cocoa h-9"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                <span>Play Memory Match Again</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
