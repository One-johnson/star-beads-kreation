"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const reviews = useQuery(api.reviews.getAllReviews, {});
  const deleteReview = useMutation(api.reviews.deleteReview);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalReview, setModalReview] = useState<any>(null);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await deleteReview({ reviewId: reviewId as any });
      toast.success("Review deleted.");
    } catch (error) {
      toast.error("Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  const filteredReviews = reviews
    ? reviews.filter((review: any) =>
        (productFilter === "" || review.productName.toLowerCase().includes(productFilter.toLowerCase()) || review.productId.includes(productFilter)) &&
        (userFilter === "" || review.userName.toLowerCase().includes(userFilter.toLowerCase()) || (review.userEmail || "").toLowerCase().includes(userFilter.toLowerCase())) &&
        (ratingFilter === 0 || review.rating === ratingFilter) &&
        (startDate === "" || new Date(review.createdAt) >= new Date(startDate)) &&
        (endDate === "" || new Date(review.createdAt) <= new Date(endDate))
      )
    : [];
  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Review Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <input
              type="text"
              placeholder="Filter by Product Name or ID"
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="Filter by User Name or Email"
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={0}>All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          {reviews === undefined ? (
            <div>Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Rating</th>
                      <th className="text-left p-2">Comment</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReviews.map((review: any) => (
                      <tr key={review._id} className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer" onClick={() => setModalReview(review)}>
                        <td className="p-2 font-mono">
                          <Link href={`/admin/products/${review.productId}/edit`} className="underline hover:text-blue-600">
                            {review.productName} <span className="text-xs text-muted-foreground">({review.productId.slice(0, 8)})</span>
                          </Link>
                        </td>
                        <td className="p-2">
                          <a href={`mailto:${review.userEmail}`} className="underline hover:text-blue-600">
                            {review.userName}
                          </a>
                        </td>
                        <td className="p-2">{renderStars(review.rating)}</td>
                        <td className="p-2 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                        <td className="p-2">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="p-2" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review._id)}
                            disabled={deletingId === review._id}
                          >
                            {deletingId === review._id ? "Deleting..." : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>
              </div>
              {/* Review Details Modal */}
              <Dialog open={!!modalReview} onOpenChange={open => !open && setModalReview(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Details</DialogTitle>
                  </DialogHeader>
                  {modalReview && (
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold">Product: </span>
                        <Link href={`/admin/products/${modalReview.productId}/edit`} className="underline hover:text-blue-600">
                          {modalReview.productName}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">({modalReview.productId})</span>
                      </div>
                      <div>
                        <span className="font-semibold">User: </span>
                        <a href={`mailto:${modalReview.userEmail}`} className="underline hover:text-blue-600">
                          {modalReview.userName}
                        </a>
                        <span className="ml-2 text-xs text-muted-foreground">({modalReview.userEmail})</span>
                      </div>
                      <div>
                        <span className="font-semibold">Rating: </span>
                        {renderStars(modalReview.rating)}
                      </div>
                      <div>
                        <span className="font-semibold">Date: </span>
                        {new Date(modalReview.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Comment: </span>
                        <div className="border rounded p-2 bg-muted/50 mt-1">
                          {modalReview.comment}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 