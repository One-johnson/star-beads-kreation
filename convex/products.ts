import { mutation, query } from "./_generated/server";
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
