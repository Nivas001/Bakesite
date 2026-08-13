import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMyReviewState, getProductReviews, submitReview } from "@/lib/reviews.functions";
import { useAuth } from "@/hooks/use-appwrite-auth";

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`size-4 ${n <= value ? "fill-berry text-berry" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

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
      toast.success("Thanks for your review!");
      await queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      await queryClient.invalidateQueries({ queryKey: ["review-state", productId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your review");
    } finally {
      setSaving(false);
    }
  }

  const data = reviewsQuery.data;

  return (
    <section className="mt-16 border-t border-border/70 pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold text-cocoa">Reviews</h2>
        {data?.average != null && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(data.average)} /> {data.average} · {data.count} review
            {data.count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {mineQuery.data?.canReview && (
        <div className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-sm font-medium">
            {mineQuery.data.mine ? "Update your review" : "You ordered this — leave a review"}
          </p>
          <div className="mt-3">
            <Stars value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            maxLength={600}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was it?"
            className="mt-3"
          />
          <Button
            className="mt-3 bg-berry text-berry-foreground hover:bg-berry/90"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? "Saving…" : "Submit review"}
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data && data.reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No reviews yet — be the first after your order is delivered.
          </p>
        )}
        {data?.reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center gap-3">
              <Stars value={review.rating} />
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>
            {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}