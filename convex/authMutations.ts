import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Find user by email
export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
  },
});

// Create user
export const createUser = mutation({
  args: { email: v.string(), name: v.string(), contact: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      contact: args.contact,
      passwordHash: args.passwordHash,
      role: "customer", // Default role
      createdAt: Date.now(),
    });
  },
});

// Create session
export const createSession = mutation({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionToken: args.sessionToken,
      createdAt: Date.now(),
    });
  },
});

// Find session by token
export const findSessionByToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("sessionToken", args.sessionToken))
      .first();
  },
});

// Delete session by id
export const deleteSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
    return { success: true };
  },
});

// Update user name
export const updateUserName = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { name: args.name });
    return { success: true };
  },
});

// Update user contact
export const updateUserContact = mutation({
  args: { userId: v.id("users"), contact: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { contact: args.contact });
    return { success: true };
  },
});

// Promote or demote a user by updating their role
export const updateUserRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true };
  },
});

// Get cart for a user
export const getCart = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
  },
});

// Add item to cart (or update quantity if exists)
export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    product: v.object({
      productId: v.id("products"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    if (!cart) {
      await ctx.db.insert("carts", {
        userId: args.userId,
        items: [args.product],
        updatedAt: Date.now(),
      });
      return;
    }
    // Check if product already in cart
    const idx = cart.items.findIndex((item: any) => item.productId === args.product.productId);
    let newItems;
    if (idx >= 0) {
      // Update quantity
      newItems = [...cart.items];
      newItems[idx].quantity += args.product.quantity;
    } else {
      newItems = [...cart.items, args.product];
    }
    await ctx.db.patch(cart._id, { items: newItems, updatedAt: Date.now() });
  },
});

// Update cart item quantity
export const updateCartItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    if (!cart) return;
    const newItems = cart.items.map((item: any) =>
      item.productId === args.productId ? { ...item, quantity: args.quantity } : item
    );
    await ctx.db.patch(cart._id, { items: newItems, updatedAt: Date.now() });
  },
});

// Remove item from cart
export const removeCartItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    if (!cart) return;
    const newItems = cart.items.filter((item: any) => item.productId !== args.productId);
    await ctx.db.patch(cart._id, { items: newItems, updatedAt: Date.now() });
  },
});

// Clear cart
export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    if (!cart) return;
    await ctx.db.patch(cart._id, { items: [], updatedAt: Date.now() });
  },
});

// Create order
export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      imageUrl: v.string(),
    })),
    total: v.number(),
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
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      items: args.items,
      total: args.total,
      status: "pending",
      shippingInfo: args.shippingInfo,
      createdAt: Date.now(),
    });
    return orderId;
  },
}); 