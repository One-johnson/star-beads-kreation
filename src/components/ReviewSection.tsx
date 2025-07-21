"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle } from "lucide-react";
import { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";

interface ReviewSectionProps {
  productId: Id<"products">;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const reviews = useQuery(api.reviews.getProductReviews, { productId });
  const addReview = useMutation(api.reviews.addReview);
  const userOrders = user ? useQuery(api.authQueries.getUserOrders, { userId: user.userId }) : undefined;
  const hasPurchased = user && userOrders && userOrders.some((order: { items: any[] }) => order.items.some((item: any) => item.productId === productId));
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // Add review mutations
  const deleteReview = useMutation(api.reviews.deleteReview);
  const updateReview = useMutation(api.reviews.updateReview);

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        userId: user.userId,
        userName: user.name,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error adding review:", error);
      alert("You have already reviewed this product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: any) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editComment.trim()) return;
    try {
      await updateReview({
        reviewId: { __tableName: "reviews" } as Id<"reviews"> & { _id?: string }, // fix type
        rating: editRating,
        comment: editComment.trim(),
      });
      setEditingReviewId(null);
      toast.success("Review updated!");
    } catch (error) {
      toast.error("Failed to update review.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview({ reviewId: { __tableName: "reviews", _id: reviewId } as unknown as Id<"reviews"> });
      toast.success("Review deleted.");
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Reviews ({reviews?.length || 0})
          </CardTitle>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(!showReviewForm)}
              disabled={!hasPurchased}
            >
              {showReviewForm ? "Cancel" : "Write Review"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Review Form */}
        {showReviewForm && user && hasPurchased && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Comment</label>
                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !comment.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Show message if user is logged in but hasn't purchased */}
        {user && !hasPurchased && (
          <div className="text-center text-muted-foreground text-sm">
            You must purchase this product before leaving a review.
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews === undefined ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {renderStars(review.rating)}
                  </Badge>
                </div>
                {editingReviewId === review._id ? (
                  <div className="space-y-2">
                    <div>{renderStars(editRating, true)}</div>
                    <Textarea
                      value={editComment}
                      onChange={e => setEditComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateReview(review._id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{review.comment}</p>
                    {user && review.userId === user.userId && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(review)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review._id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 