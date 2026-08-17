import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, RotateCcw, CheckCircle2, XCircle, Timer, HelpCircle, Loader2 } from "lucide-react";
import type { VoucherReward } from "./voucher-reward-modal";

interface QuizGameProps {
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

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What premium chocolate do we craft our Belgian Truffle Cake with?",
    options: [
      "70% Belgian Dark Couverture Chocolate",
      "Standard compound cocoa powder",
      "Commercial milk chocolate drops",
      "Artificial chocolate syrup",
    ],
    correctIndex: 0,
    explanation: "We only use pure 70% Belgian dark couverture chocolate for deep cocoa intensity and silky ganache.",
  },
  {
    id: 2,
    question: "How much advance notice is required for our fresh small-batch bakes?",
    options: [
      "Instant 5-minute microwave baking",
      "At least 24 hours of advance artisan notice",
      "3 weeks minimum waiting period",
      "No advance booking needed",
    ],
    correctIndex: 1,
    explanation: "Small-batch baking requires 24 hours notice so every sponge is baked fresh on the morning of delivery.",
  },
  {
    id: 3,
    question: "What gives our Korean Bento Cakes their signature charm?",
    options: [
      "Mass manufactured cardboard boxes",
      "4-inch handcrafted single-serve aesthetic lunchbox format",
      "Pre-frozen store inventory",
      "Only plain white frosting",
    ],
    correctIndex: 1,
    explanation: "Our 4-inch mini Bento Cakes are personalized with custom colors and pastel lettering in cute lunchboxes!",
  },
  {
    id: 4,
    question: "How are our fruit fillings and berry compotes prepared?",
    options: [
      "Canned preservative fruit gels",
      "Artificially dyed flavored syrups",
      "100% Real farm-fresh berries & simmered Alphonso mangoes",
      "Synthetic strawberry jelly powders",
    ],
    correctIndex: 2,
    explanation: "We slow-simmer real farm berries and seasonal mangoes with zero artificial food dyes.",
  },
  {
    id: 5,
    question: "What makes our Chunky Choc Cookies so irresistibly chewy?",
    options: [
      "Commercial baking mix and palm oil",
      "Slow-chilled brown butter dough and giant chocolate pockets",
      "Store-bought pre-baked biscuit crumbs",
      "High temperature flash frying",
    ],
    correctIndex: 1,
    explanation: "Our dough is chilled for 24 hours with pure brown butter and hand-chopped chocolate chunks.",
  },
];

export function QuizGame({ onWin, claimCouponFn }: QuizGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // 60-second game countdown timer
  useEffect(() => {
    if (isGameOver) return;
    if (timeLeft <= 0) {
      setIsGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const currentQ = QUIZ_QUESTIONS[currentIdx]!;

  function handleSelectOption(optionIndex: number) {
    if (isAnswerSubmitted || isGameOver) return;
    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    if (optionIndex === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsGameOver(true);
    }
  }

  async function handleClaimPrize() {
    setIsClaiming(true);
    try {
      const reward = await claimCouponFn({
        gameId: "quiz",
        gameName: "Ani Bakes Confectionery Trivia Quiz",
      });
      onWin({
        code: reward.code,
        discountPercent: reward.discountPercent,
        expiresAt: reward.expiresAt,
        description: reward.description ?? undefined,
        gameName: "Confectionery Trivia Quiz",
      });
    } catch {
      // Fallback
    } finally {
      setIsClaiming(false);
    }
  }

  function handleRestart() {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTimeLeft(60);
    setIsGameOver(false);
  }

  const isPassed = score >= 4;

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card p-4 sm:p-7 shadow-soft">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-berry/10 text-berry">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <h3 className="font-blogh text-base sm:text-lg font-bold text-cocoa leading-tight">
              Bakery Confectionery Trivia
            </h3>
            <p className="text-[11px] text-muted-foreground">Score 4/5 or more to win a 15% coupon</p>
          </div>
        </div>

        {/* Timer & Score Pill */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            timeLeft < 15 ? "bg-rose-500/15 text-rose-600 animate-pulse" : "bg-secondary text-cocoa"
          }`}>
            <Timer className="size-3.5" />
            <span>{timeLeft}s</span>
          </div>

          <div className="rounded-full bg-berry/15 px-3 py-1 text-xs font-bold text-berry">
            Score: {score}/{QUIZ_QUESTIONS.length}
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="mt-5 space-y-5">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-berry transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="rounded-2xl bg-secondary/60 p-4 sm:p-5 border border-border/50">
            <p className="font-display text-base sm:text-lg font-bold text-cocoa leading-snug">
              {currentQ.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let styleClasses = "border-border hover:border-berry/60 bg-card text-cocoa";

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  styleClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold";
                } else if (isSelected) {
                  styleClasses = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-medium";
                } else {
                  styleClasses = "opacity-50 border-border bg-card text-muted-foreground";
                }
              } else if (isSelected) {
                styleClasses = "border-berry bg-berry/10 text-berry font-semibold";
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left text-xs sm:text-sm transition-all duration-200 cursor-pointer ${styleClasses}`}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Button */}
          {isAnswerSubmitted && (
            <div className="space-y-3 rounded-2xl bg-secondary/80 p-4 border border-border/70 animate-fadeIn">
              <p className="text-xs text-cocoa leading-relaxed">
                <span className="font-bold text-berry">Chef&apos;s Fact: </span>
                {currentQ.explanation}
              </p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleNextQuestion}
                  className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs px-5 h-9"
                >
                  {currentIdx < QUIZ_QUESTIONS.length - 1 ? "Next Question →" : "See Final Score"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Game Over Results */
        <div className="mt-6 text-center space-y-5">
          <div className="flex justify-center">
            <div className={`flex size-16 items-center justify-center rounded-3xl ${
              isPassed ? "bg-amber-500/20 text-amber-500" : "bg-rose-500/20 text-rose-500"
            }`}>
              <Trophy className="size-9 animate-bounce" />
            </div>
          </div>

          <div>
            <h4 className="font-blogh text-2xl sm:text-3xl font-bold text-cocoa">
              {isPassed ? "TRIVIA MASTER CONQUERED!" : "NICE EFFORT, BAKER!"}
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              You scored <span className="font-bold text-cocoa">{score} out of {QUIZ_QUESTIONS.length}</span> correct answers.
            </p>
          </div>

          {isPassed ? (
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
                You need at least 4 correct answers to win the 15% coupon. Don&apos;t worry, you can retry anytime!
              </p>
              <Button
                type="button"
                onClick={handleRestart}
                variant="outline"
                className="rounded-xl font-bold text-xs border-border hover:border-berry text-cocoa h-9"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                <span>Try Quiz Again</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
