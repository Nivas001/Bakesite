import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Star, ShieldCheck, Sparkles, MessageSquare, Quote, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMyReviewState, getProductReviews, submitReview } from "@/lib/reviews.functions";
import { useAuth } from "@/hooks/use-appwrite-auth";

function Stars({
  value,
  onChange,
  size = "size-4",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
        >
          <Star
            className={`${size} ${
              n <= value
                ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-pink-500/15 text-pink-700 dark:text-pink-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
];

export function ProductReviews({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const { signedIn } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReviews = useServerFn(getProductReviews);
  const fetchMine = useServerFn(getMyReviewState);
  const save = useServerFn(submitReview);

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews({ data: productId }),
  });

  const mineQuery = useQuery({
    queryKey: ["review-state", productId, signedIn],
    queryFn: () => fetchMine({ data: productId }),
    enabled: signedIn,
  });

  useEffect(() => {
    const mine = mineQuery.data?.mine;
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    }
  }, [mineQuery.data]);

  async function handleSubmit() {
    setSaving(true);
    try {
      await save({ data: { productId, rating, comment: comment.trim() || undefined } });
      toast.success("Thank you! Your tasting review has been shared.");
      await queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      await queryClient.invalidateQueries({ queryKey: ["review-state", productId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your review");
    } finally {
      setSaving(false);
    }
  }

  const data = reviewsQuery.data;
  const reviewList = data?.reviews ?? [];
  const averageRating = data?.average ?? 5.0;
  const reviewCount = data?.count ?? 0;

  return (
    <section className="mt-16 sm:mt-20 border-t border-border/60 pt-10 sm:pt-14 space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="size-4 text-berry" />
            <span className="text-xs font-bold uppercase tracking-wider text-berry">
              Artisan Quality & Feedback
            </span>
          </div>
          <h2 className="font-blogh text-2xl sm:text-3xl lg:text-4xl font-bold text-cocoa uppercase tracking-wide">
            Reviews & Tasting Notes
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real feedback from bakery lovers on texture, aroma, and small-batch freshness.
          </p>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 border border-border/60 shadow-2xs">
            <Stars value={Math.round(averageRating)} size="size-3.5" />
            <span className="text-xs font-bold text-cocoa">
              {averageRating.toFixed(1)} / 5.0 ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* 2-Column Bento Reviews Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        
        {/* Left Bento Column: Rating Scorecard & Write Form */}
        <div className="space-y-5">
          {/* Rating Summary Card */}
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-secondary/40 to-card p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-sans text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
                  {reviewCount > 0 ? averageRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-xs font-semibold text-muted-foreground ml-1">/ 5.0</span>
              </div>
              <Stars value={reviewCount > 0 ? Math.round(averageRating) : 5} size="size-4.5" />
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>5 Stars (Flawless)</span>
                <span className="font-bold text-cocoa">{reviewCount > 0 ? "95%" : "100%"}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[95%]" />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>4 Stars (Very Good)</span>
                <span className="font-bold text-cocoa">{reviewCount > 0 ? "5%" : "0%"}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-amber-400/60 rounded-full w-[5%]" />
              </div>
            </div>

            {/* Quality Guarantee Pill */}
            <div className="flex items-center gap-2 rounded-2xl bg-matcha/40 border border-matcha/70 p-3 text-xs text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span className="leading-tight font-medium">
                100% small-batch baked the morning of dispatch with pure dairy butter.
              </span>
            </div>
          </div>

          {/* Write / Update Review Form (When customer has placed an order) */}
          {mineQuery.data?.canReview ? (
            <div className="rounded-3xl border border-berry/30 bg-card p-5 sm:p-6 shadow-soft space-y-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-berry" />
                <h3 className="font-blogh text-base font-bold text-cocoa">
                  {mineQuery.data.mine ? "Update Your Review" : "Leave a Tasting Review"}
                </h3>
              </div>

              <p className="text-xs text-muted-foreground">
                You ordered this bake! Rate your fresh tasting experience:
              </p>

              <div>
                <Stars value={rating} onChange={setRating} size="size-5" />
              </div>

              <Textarea
                value={comment}
                maxLength={600}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the crumb, aroma, and sweetness?"
                className="resize-none rounded-2xl border-border/80 bg-secondary/30 text-xs sm:text-sm focus-visible:ring-berry min-h-[90px]"
              />

              <Button
                type="button"
                className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs shadow-soft h-10 cursor-pointer"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>{mineQuery.data.mine ? "Update Tasting Review" : "Post Review"}</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/30 p-4 text-center">
              <p className="text-xs text-muted-foreground leading-snug">
                💬 <strong className="text-cocoa">Verified Customer Reviews:</strong> Only customers who have placed an order for this bake can submit a verified review.
              </p>
            </div>
          )}
        </div>

        {/* Right Bento Column: Reviews Stream Cards */}
        <div className="space-y-4">
          {reviewList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-berry shadow-inner">
                <Heart className="size-7 text-berry/80 animate-pulse" />
              </div>
              <h3 className="font-blogh text-lg font-bold text-cocoa">
                Fresh From the Kitchen
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                This artisanal creation is baked fresh to order. Be the first to taste and share your review once your order arrives!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {reviewList.map((review, i) => {
                const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length]!;
                const initial = String.fromCharCode(65 + (i * 3) % 26);

                return (
                  <article
                    key={review.id}
                    className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Row: User Avatar + Stars + Verified Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${colorClass}`}>
                            {initial}B
                          </div>
                          <div>
                            <p className="text-xs font-bold text-cocoa leading-none">
                              Verified Baker
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="size-3 text-emerald-500" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="mt-2.5">
                        <Stars value={review.rating} size="size-3.5" />
                      </div>

                      {/* Comment */}
                      {review.comment ? (
                        <div className="mt-2 text-xs sm:text-sm text-foreground/90 leading-relaxed relative">
                          <Quote className="size-3 text-muted-foreground/30 inline mr-1 -mt-1" />
                          <span>{review.comment}</span>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground italic">
                          Rated {review.rating} out of 5 stars with full satisfaction.
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40 flex items-center justify-between">
                      <span>Morning Bake Order</span>
                      <span className="font-semibold text-cocoa">Ani Bakes Kitchen</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}