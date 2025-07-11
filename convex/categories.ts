import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .order("asc")
      .collect();

    return categories;
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();

    return products;
  },
});

// Add a new category
export const addCategory = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });
  },
}); 