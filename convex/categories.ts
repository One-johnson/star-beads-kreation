import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

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

// Helper to get all user IDs
async function getAllUserIds(ctx: any) {
  const users = await ctx.db.query("users").collect();
  return users.map((u: any) => u._id);
}

// Helper to get all admin user IDs
async function getAllAdminUserIds(ctx: any) {
  const users = await ctx.db.query("users").collect();
  return users.filter((u: any) => u.role === "admin").map((u: any) => u._id);
}

// Add a new category
export const addCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description || "",
      imageUrl: args.imageUrl || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    // Notify all admins and users
    const adminIds = await getAllAdminUserIds(ctx);
    const userIds = await getAllUserIds(ctx);
    for (const adminId of adminIds) {
      await ctx.db.insert("notifications", {
        userId: adminId,
        type: "category",
        title: "New Category Created",
        message: `A new category '${args.name}' has been created!`,
        link: `/admin/categories`,
        read: false,
        createdAt: Date.now(),
      });
    }
    for (const userId of userIds) {
      await ctx.db.insert("notifications", {
        userId,
        type: "category",
        title: "New Category Created",
        message: `Check out our new category: '${args.name}'!`,
        link: `/categories/${categoryId}`,
        read: false,
        createdAt: Date.now(),
      });
    }
    return categoryId;
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.categoryId, {
      name: args.name,
      description: args.description || "",
      imageUrl: args.imageUrl || "",
      updatedAt: Date.now(),
    });
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteById = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
}); 