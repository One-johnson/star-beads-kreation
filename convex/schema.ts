import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.optional(v.string()), // New: product category
    tags: v.optional(v.array(v.string())), // New: product tags for search
    stock: v.optional(v.number()), // New: inventory tracking
    rating: v.optional(v.number()), // New: average rating
    reviewCount: v.optional(v.number()), // New: number of reviews
    createdAt: v.number(),
  }).index("by_category", ["category"]).index("by_tags", ["tags"]),
  users: defineTable({
    email: v.string(),
    name: v.string(),
    contact: v.optional(v.string()),
    passwordHash: v.string(),
    role: v.string(), // New: user role ('admin', 'manager', 'customer')
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["sessionToken"]),
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    })),
    total: v.number(),
    status: v.string(), // "pending", "processing", "shipped", "delivered", "cancelled"
    shippingInfo: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  carts: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    })),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // New tables for Phase 4
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  }).index("by_product", ["productId"]).index("by_user", ["userId"]),
  
  wishlists: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_product", ["productId"]),
  
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }),
}); 