import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("customer")),
    contact: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    })),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
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
    trackingNumber: v.optional(v.string()),
    carrier: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Existing tables that were removed
  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["sessionToken"]),

  carts: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    })),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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

  // CMS Tables
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    author: v.id("users"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled")),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    type: v.optional(v.union(v.literal("blog"), v.literal("video"), v.literal("tutorial"))),
    videoUrl: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_status", ["status"]).index("by_author", ["author"]),

  pages: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    pageType: v.union(
      v.literal("about"),
      v.literal("faq"),
      v.literal("terms"),
      v.literal("privacy"),
      v.literal("contact"),
      v.literal("custom")
    ),
    status: v.union(v.literal("draft"), v.literal("published")),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_type", ["pageType"]).index("by_status", ["status"]),

  media: defineTable({
    filename: v.string(),
    originalName: v.string(),
    url: v.string(),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_uploader", ["uploadedBy"]),

  notifications: defineTable({
    userId: v.id("users"), // Who receives the notification
    type: v.string(), // e.g. "order", "review", "stock", "signup", "message"
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()), // e.g. /admin/orders/123
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
}); 