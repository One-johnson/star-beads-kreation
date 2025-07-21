import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Product schema: name, description, price, imageUrl, createdAt
// You can expand this as needed

// Helper to get all customer user IDs
async function getAllCustomerUserIds(ctx: any) {
  const users = await ctx.db.query("users").collect();
  return users.filter((u: any) => u.role === "customer").map((u: any) => u._id);
}

// Helper to get all admin user IDs
async function getAllAdminUserIds(ctx: any) {
  const users = await ctx.db.query("users").collect();
  return users.filter((u: any) => u.role === "admin").map((u: any) => u._id);
}

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

    // Notify all customers of new product
    const customerIds = await getAllCustomerUserIds(ctx);
    for (const customerId of customerIds) {
      await ctx.db.insert("notifications", {
        userId: customerId,
        type: "product",
        title: "New Product Added!",
        message: `Check out our new product: ${args.name}`,
        link: `/products/${product}`,
        read: false,
        createdAt: Date.now(),
      });
    }
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
    // Get previous product data
    const prevProduct = await ctx.db.get(id);
    const product = await ctx.db.patch(id, updates);

    // If price changed, notify wishlisters and previous buyers
    if (updates.price !== undefined && prevProduct && updates.price !== prevProduct.price) {
      // Notify wishlisters
      const wishlists = await ctx.db.query("wishlists")
        .withIndex("by_product", q => q.eq("productId", id))
        .collect();
      for (const wishlist of wishlists) {
        await ctx.db.insert("notifications", {
          userId: wishlist.userId,
          type: "product",
          title: "Price Drop!",
          message: `The price of a product on your wishlist has changed: ${updates.name || prevProduct.name}`,
          link: `/products/${id}`,
          read: false,
          createdAt: Date.now(),
        });
      }
      // Notify previous buyers
      const orders = await ctx.db.query("orders")
        .withIndex("by_user", q => q)
        .collect();
      const buyers = new Set<Id<"users">>();
      for (const order of orders) {
        if (order.items.some((item: any) => item.productId === id)) {
          buyers.add(order.userId);
        }
      }
      for (const buyerId of buyers) {
        await ctx.db.insert("notifications", {
          userId: buyerId,
          type: "product",
          title: "Price Drop!",
          message: `A product you purchased has a new price: ${updates.name || prevProduct.name}`,
          link: `/products/${id}`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    // Low stock notification to admins
    if (updates.stock !== undefined && prevProduct) {
      const wasLow = prevProduct.stock !== undefined && prevProduct.stock <= 5;
      const isLow = updates.stock <= 5;
      if (!wasLow && isLow) {
        // Notify all admins
        const adminIds = await getAllAdminUserIds(ctx);
        for (const adminId of adminIds) {
          await ctx.db.insert("notifications", {
            userId: adminId,
            type: "stock",
            title: "Low Stock Alert",
            message: `Stock for ${updates.name || prevProduct.name} is low (${updates.stock} left)`,
            link: `/admin/products/${id}`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
      // Restock notification to wishlisters and buyers
      if (wasLow && updates.stock > 5) {
        // Notify wishlisters
        const wishlists = await ctx.db.query("wishlists")
          .withIndex("by_product", q => q.eq("productId", id))
          .collect();
        for (const wishlist of wishlists) {
          await ctx.db.insert("notifications", {
            userId: wishlist.userId,
            type: "stock",
            title: "Product Restocked!",
            message: `${updates.name || prevProduct.name} is back in stock!`,
            link: `/products/${id}`,
            read: false,
            createdAt: Date.now(),
          });
        }
        // Notify previous buyers
        const orders = await ctx.db.query("orders")
          .withIndex("by_user", q => q)
          .collect();
        const buyers = new Set<Id<"users">>();
        for (const order of orders) {
          if (order.items.some((item: any) => item.productId === id)) {
            buyers.add(order.userId);
          }
        }
        for (const buyerId of buyers) {
          await ctx.db.insert("notifications", {
            userId: buyerId,
            type: "stock",
            title: "Product Restocked!",
            message: `${updates.name || prevProduct.name} is back in stock!`,
            link: `/products/${id}`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }
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
      // Get previous product data
      const prevProduct = await ctx.db.get(update.id);
      const result = await ctx.db.patch(update.id, { stock: update.stock });
      // Low stock notification to admins
      if (prevProduct) {
        const wasLow = prevProduct.stock !== undefined && prevProduct.stock <= 5;
        const isLow = update.stock <= 5;
        if (!wasLow && isLow) {
          const adminIds = await getAllAdminUserIds(ctx);
          for (const adminId of adminIds) {
            await ctx.db.insert("notifications", {
              userId: adminId,
              type: "stock",
              title: "Low Stock Alert",
              message: `Stock for ${prevProduct.name} is low (${update.stock} left)` ,
              link: `/admin/products/${update.id}`,
              read: false,
              createdAt: Date.now(),
            });
          }
        }
        // Restock notification to wishlisters and buyers
        if (wasLow && update.stock > 5) {
          const wishlists = await ctx.db.query("wishlists")
            .withIndex("by_product", q => q.eq("productId", update.id))
            .collect();
          for (const wishlist of wishlists) {
            await ctx.db.insert("notifications", {
              userId: wishlist.userId,
              type: "stock",
              title: "Product Restocked!",
              message: `${prevProduct.name} is back in stock!`,
              link: `/products/${update.id}`,
              read: false,
              createdAt: Date.now(),
            });
          }
          const orders = await ctx.db.query("orders")
            .withIndex("by_user", q => q)
            .collect();
          const buyers = new Set<Id<"users">>();
          for (const order of orders) {
            if (order.items.some((item: any) => item.productId === update.id)) {
              buyers.add(order.userId);
            }
          }
          for (const buyerId of buyers) {
            await ctx.db.insert("notifications", {
              userId: buyerId,
              type: "stock",
              title: "Product Restocked!",
              message: `${prevProduct.name} is back in stock!`,
              link: `/products/${update.id}`,
              read: false,
              createdAt: Date.now(),
            });
          }
        }
      }
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
