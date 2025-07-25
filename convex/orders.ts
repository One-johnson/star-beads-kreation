import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get order by ID with user details
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const user = await ctx.db.get(order.userId);
    return {
      ...order,
      user: user ? { name: user.name, email: user.email } : null,
    };
  },
});

// Get all orders with user details
export const getAllOrdersWithUsers = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").collect();

    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

// Get orders by status
export const getOrdersByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    const filteredOrders = orders.filter(
      (order) => order.status === args.status
    );

    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      filteredOrders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

// Search orders
export const searchOrders = query({
  args: {
    query: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    minTotal: v.optional(v.number()),
    maxTotal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();

    // Filter by search query
    if (args.query) {
      const query = args.query.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.shippingInfo.fullName.toLowerCase().includes(query) ||
          order.shippingInfo.email.toLowerCase().includes(query) ||
          order.items.some((item: any) =>
            item.name.toLowerCase().includes(query)
          )
      );
    }

    // Filter by status
    if (args.status) {
      orders = orders.filter((order) => order.status === args.status);
    }

    // Filter by date range
    if (args.startDate) {
      orders = orders.filter((order) => order.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      orders = orders.filter((order) => order.createdAt <= args.endDate!);
    }

    // Filter by total amount
    if (args.minTotal) {
      orders = orders.filter((order) => order.total >= args.minTotal!);
    }
    if (args.maxTotal) {
      orders = orders.filter((order) => order.total <= args.maxTotal!);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt - a.createdAt);

    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

// Helper to get all admin user IDs
async function getAdminUserIds(ctx: any) {
  const admins = await ctx.db.query("users").collect();
  return admins.filter((u: any) => u.role === "admin").map((u: any) => u._id);
}

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Get the order with user details
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update the order status
    await ctx.db.patch(args.orderId, { status: args.status });

    // Send notifications if status is not pending
    if (args.status !== "pending") {
      // Notify customer
      await ctx.db.insert("notifications", {
        userId: order.userId,
        type: "order-status",
        title: `Order Status Updated`,
        message: `Your order #${order._id} status is now '${args.status}'.`,
        link: `/orders/${order._id}`,
        read: false,
        createdAt: Date.now(),
      });
      // Notify all admins
      const adminIds = await getAdminUserIds(ctx);
      for (const adminId of adminIds) {
        await ctx.db.insert("notifications", {
          userId: adminId,
          type: "order-status",
          title: `Order Status Updated`,
          message: `Order #${order._id} status is now '${args.status}'.`,
          link: `/admin/orders/${order._id}`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    // (Removed email notification for order status updates)

    return { success: true };
  },
});

// Bulk update order status
export const bulkUpdateOrderStatus = mutation({
  args: {
    orderIds: v.array(v.id("orders")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Defensive: filter out any undefined/null/empty values
    const validOrderIds = args.orderIds.filter(
      (orderId) => typeof orderId === "string" && !!orderId
    );
    const results: any[] = [];
    const notFound: string[] = [];
    for (const orderId of validOrderIds) {
      const result = await ctx.db.patch(orderId, { status: args.status });
      if (result === undefined) {
        notFound.push(orderId);
        continue;
      }
      results.push(result);
    }
    return { updated: results, notFound };
  },
});

// Add tracking number to order
export const addTrackingNumber = mutation({
  args: {
    orderId: v.id("orders"),
    trackingNumber: v.string(),
    carrier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      trackingNumber: args.trackingNumber,
      carrier: args.carrier,
    });
    return { success: true };
  },
});

// Get order statistics
export const getOrderStats = query({
  args: {
    period: v.optional(
      v.union(
        v.literal("today"),
        v.literal("week"),
        v.literal("month"),
        v.literal("year")
      )
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();

    let filteredOrders = orders;
    const now = Date.now();

    if (args.period) {
      const periods = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      };

      const cutoff = now - periods[args.period];
      filteredOrders = orders.filter((order) => order.createdAt >= cutoff);
    }

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const statusCounts = filteredOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusCounts,
    };
  },
});

// Get recent orders (last N orders)
export const getRecentOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const orders = await ctx.db.query("orders").order("desc").take(limit);

    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

// Delete order mutation
export const deleteOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    // Get the order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    // Delete the order
    await ctx.db.delete(args.orderId);
    // Optionally, delete related notifications, etc.
    return { success: true };
  },
});

// Bulk delete orders mutation
export const bulkDeleteOrders = mutation({
  args: { orderIds: v.array(v.id("orders")) },
  handler: async (ctx, args) => {
    for (const orderId of args.orderIds) {
      await ctx.db.delete(orderId);
    }
    return { success: true };
  },
});
