import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// Product schema: name, description, price, imageUrl, createdAt
// You can expand this as needed

// Create a product
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      imageUrl: args.imageUrl,
      category: args.category,
      tags: args.tags || [],
      stock: args.stock || 0,
      createdAt: Date.now(),
    });
    return product;
  },
});

// List all products
export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

// Get a product by ID
export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Search products
export const searchProducts = query({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("price"), v.literal("name"), v.literal("rating"), v.literal("createdAt"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Filter by search query
    if (args.query) {
      const query = args.query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by category
    if (args.category) {
      products = products.filter(product => product.category === args.category);
    }

    // Filter by price range
    if (args.minPrice !== undefined) {
      products = products.filter(product => product.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      products = products.filter(product => product.price <= args.maxPrice!);
    }

    // Sort products
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";
    
    products.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === "rating") {
        aValue = a.rating || 0;
        bValue = b.rating || 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return products;
  },
});

// Get related products
export const getRelatedProducts = query({
  args: { 
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product || !product.category) return [];

    const limit = args.limit || 4;
    
    // Get products in the same category
    const relatedProducts = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", product.category))
      .filter((q) => q.neq(q.field("_id"), args.productId))
      .order("desc")
      .take(limit);

    return relatedProducts;
  },
});

// Update a product
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const product = await ctx.db.patch(id, updates);
    return product;
  },
});

// Delete a product
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Bulk update product stock
export const bulkUpdateStock = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("products"),
      stock: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const update of args.updates) {
      const result = await ctx.db.patch(update.id, { stock: update.stock });
      results.push(result);
    }
    return results;
  },
});

// Bulk delete products
export const bulkDeleteProducts = mutation({
  args: {
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const productId of args.productIds) {
      const result = await ctx.db.delete(productId);
      results.push(result);
    }
    return results;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const adminStoreImageFromUrl = action({
  args: { imageUrl: v.string(), adminId: v.string() },
  handler: async (ctx, args) => {
    // (Optional) Check admin privileges here
    // const admin = await ctx.db.get(args.adminId);
    // if (!admin || admin.role !== "admin") throw new Error("Not authorized");

    // Download the image
    const response = await fetch(args.imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");
    const image = await response.blob();

    // Store in Convex storage
    const storageId = await ctx.storage.store(image);

    // Return the storageId
    return storageId;
  },
});

export const deleteById = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId);
  },
});

// Get storage URL for a given storage ID
export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
