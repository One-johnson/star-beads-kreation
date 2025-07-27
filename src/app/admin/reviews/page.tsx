"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


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
  const [confirmDialogId, setConfirmDialogId] = useState<string | null>(null);


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
    ? reviews.filter(
        (review: any) =>
          (productFilter === "" ||
            review.productName
              .toLowerCase()
              .includes(productFilter.toLowerCase()) ||
            review.productId.includes(productFilter)) &&
          (userFilter === "" ||
            review.userName.toLowerCase().includes(userFilter.toLowerCase()) ||
            (review.userEmail || "")
              .toLowerCase()
              .includes(userFilter.toLowerCase())) &&
          (ratingFilter === 0 || review.rating === ratingFilter) &&
          (startDate === "" ||
            new Date(review.createdAt) >= new Date(startDate)) &&
          (endDate === "" || new Date(review.createdAt) <= new Date(endDate))
      )
    : [];
  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
            <Input
              placeholder="Filter by Product Name or ID"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-[250px]"
            />
            <Input
              placeholder="Filter by User Name or Email"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-[250px]"
            />
            <Select
              value={String(ratingFilter)}
              onValueChange={(v) => setRatingFilter(Number(v))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} Stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          {reviews === undefined ? (
            <div>Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReviews.map((review: any) => (
                      <TableRow
                        key={review._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setModalReview(review)}
                      >
                        <TableCell className="font-mono">
                          <Link
                            href={`/admin/products/${review.productId}/edit`}
                            className="underline hover:text-blue-600"
                          >
                            {review.productName}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({review.productId.slice(0, 8)})
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${review.userEmail}`}
                            className="underline hover:text-blue-600"
                          >
                            {review.userName}
                          </a>
                        </TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={review.comment}
                        >
                          {review.comment}
                        </TableCell>
                        <TableCell>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmDialogId(review._id)}
                            disabled={deletingId === review._id}
                          >
                            {deletingId === review._id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Dialog
                open={!!confirmDialogId}
                onOpenChange={() => setConfirmDialogId(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>
                      Are you sure you want to delete this review? This action
                      cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDialogId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirmDialogId) {
                            handleDelete(confirmDialogId);
                            setConfirmDialogId(null);
                          }
                        }}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <Dialog
                open={!!modalReview}
                onOpenChange={(open) => !open && setModalReview(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Details</DialogTitle>
                  </DialogHeader>
                  {modalReview && (
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold">Product: </span>
                        <Link
                          href={`/admin/products/${modalReview.productId}/edit`}
                          className="underline hover:text-blue-600"
                        >
                          {modalReview.productName}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({modalReview.productId})
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">User: </span>
                        <a
                          href={`mailto:${modalReview.userEmail}`}
                          className="underline hover:text-blue-600"
                        >
                          {modalReview.userName}
                        </a>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({modalReview.userEmail})
                        </span>
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
