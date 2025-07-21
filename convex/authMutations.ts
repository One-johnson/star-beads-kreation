import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

// Helper to get all admin user IDs
async function getAdminUserIds(ctx: any) {
  const admins = await ctx.db.query("users").collect();
  return admins.filter((u: any) => u.role === "admin").map((u: any) => u._id);
}

// Create user
export const createUser = mutation({
  args: { 
    email: v.string(), 
    name: v.string(), 
    contact: v.string(), 
    passwordHash: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("customer")))
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role || "customer",
      contact: args.contact,
      createdAt: Date.now(),
    });

    // Notify all admins of new signup
    const adminIds = await getAdminUserIds(ctx);
    for (const adminId of adminIds) {
      await ctx.db.insert("notifications", {
        userId: adminId,
        type: "signup",
        title: "New User Signup",
        message: `${args.name} (${args.email}) just signed up!`,
        link: undefined,
        read: false,
        createdAt: Date.now(),
      });
    }
    // (Optional) Welcome notification for the new user
    await ctx.db.insert("notifications", {
      userId,
      type: "welcome",
      title: "Welcome to Star Beads Kreation!",
      message: `Hi ${args.name}, thanks for signing up!`,
      link: undefined,
      read: false,
      createdAt: Date.now(),
    });

    return userId;
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
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("customer")) },
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

    // Notify all admins of new order
    const adminIds = await getAdminUserIds(ctx);
    for (const adminId of adminIds) {
      await ctx.db.insert("notifications", {
        userId: adminId,
        type: "order",
        title: "New Order Placed",
        message: `Order placed by ${args.shippingInfo.fullName}`,
        link: `/admin/orders/${orderId}`,
        read: false,
        createdAt: Date.now(),
      });
    }
    // Notify customer
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "order",
      title: "Order Placed Successfully!",
      message: `Your order has been placed. We'll keep you updated!`,
      link: `/orders/${orderId}`,
      read: false,
      createdAt: Date.now(),
    });

    // Send order confirmation email
    try {
      console.log("Starting email process for order:", orderId);
      console.log("Customer email:", args.shippingInfo.email);
      
      const emailData = {
        orderId: orderId,
        customerName: args.shippingInfo.fullName,
        customerEmail: args.shippingInfo.email,
        orderTotal: args.total,
        orderItems: args.items,
        shippingAddress: {
          fullName: args.shippingInfo.fullName,
          address: args.shippingInfo.address,
          city: args.shippingInfo.city,
          state: args.shippingInfo.state,
          zipCode: args.shippingInfo.zipCode,
        },
        status: "pending",
        orderDate: new Date().toLocaleDateString(),
      };

      console.log("Email data prepared:", emailData);

      // Send email notification
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendOrderConfirmationEmail,
        {
          emailData,
        }
      );
      
      console.log("Email scheduled successfully for order:", orderId);
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      // Don't fail the order creation if email fails
    }

    return orderId;
  },
}); 