import { query } from "./_generated/server";
import { v } from "convex/values";

// Get current user by session token
export const getCurrentUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { email: user.email, name: user.name, contact: user.contact, userId: user._id };
  },
});

// Get all orders for a user
export const getUserOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get cart count for a user
export const getCartCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    
    if (!cart || !cart.items) return 0;
    
    // Calculate total quantity of all items in cart
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
});

// Get order by ID
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Admin queries
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
}); 