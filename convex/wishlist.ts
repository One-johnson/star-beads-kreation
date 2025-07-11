import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's wishlist
export const getUserWishlist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wishlistItems = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get product details for each wishlist item
    const products = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return products.filter((item) => item.product !== null);
  },
});

// Add product to wishlist
export const addToWishlist = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Check if already in wishlist
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existing) {
      throw new Error("Product already in wishlist");
    }

    return await ctx.db.insert("wishlists", {
      userId: args.userId,
      productId: args.productId,
      createdAt: Date.now(),
    });
  },
});

// Remove product from wishlist
export const removeFromWishlist = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const wishlistItem = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (wishlistItem) {
      await ctx.db.delete(wishlistItem._id);
    }
  },
});

// Check if product is in user's wishlist
export const isInWishlist = query({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const wishlistItem = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    return !!wishlistItem;
  },
}); 