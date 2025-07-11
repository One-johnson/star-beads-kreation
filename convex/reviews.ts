import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get reviews for a product
export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();

    return reviews;
  },
});

// Add a review
export const addReview = mutation({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Add the review
    const reviewId = await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: args.userId,
      userName: args.userName,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update product rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await ctx.db.patch(args.productId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });

    return reviewId;
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return reviews;
  },
}); 