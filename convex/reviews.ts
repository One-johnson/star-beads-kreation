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

// Helper to get all admin user IDs
async function getAdminUserIds(ctx: any) {
  const admins = await ctx.db.query("users").collect();
  return admins.filter((u: any) => u.role === "admin").map((u: any) => u._id);
}

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

    // Check if user has purchased this product
    const userOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const hasPurchased = userOrders.some(order =>
      order.items.some((item: any) => item.productId === args.productId)
    );
    if (!hasPurchased) {
      throw new Error("You can only review products you have purchased.");
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

    // Notify all admins of new review
    const product = await ctx.db.get(args.productId);
    const adminIds = await getAdminUserIds(ctx);
    for (const adminId of adminIds) {
      await ctx.db.insert("notifications", {
        userId: adminId,
        type: "review",
        title: "New Product Review",
        message: `New review by ${args.userName} on ${product?.name || 'a product'}`,
        link: `/admin/reviews`,
        read: false,
        createdAt: Date.now(),
      });
    }

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

// Delete a review
export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    await ctx.db.delete(args.reviewId);
    // Update product rating and review count
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", review.productId))
      .collect();
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    await ctx.db.patch(review.productId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
    return true;
  },
});

// Update a review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      comment: args.comment,
    });
    // Update product rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", review.productId))
      .collect();
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    await ctx.db.patch(review.productId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
    return true;
  },
});

// Get all reviews (admin, with product name and user email)
export const getAllReviews = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").order("desc").collect();
    return await Promise.all(reviews.map(async (review) => {
      const product = await ctx.db.get(review.productId);
      const user = await ctx.db.get(review.userId);
      return {
        ...review,
        productName: product ? product.name : "(deleted)",
        userEmail: user ? user.email : undefined,
      };
    }));
  },
}); 