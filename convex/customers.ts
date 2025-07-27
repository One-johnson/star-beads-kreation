import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createCustomer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    contact: v.optional(v.string()),

    role: v.optional(v.union(v.literal("admin"), v.literal("customer"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const customerId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      contact: args.contact || "",
      role: "customer",
      createdAt: Date.now(),
      passwordHash: "",
    });

    async function getAllAdminUserIds(ctx: any) {
      const users = await ctx.db.query("users").collect();
      return users
        .filter((u: any) => u.role === "admin")
        .map((u: any) => u._id);
    }

    const adminIds = await getAllAdminUserIds(ctx);
    for (const adminId of adminIds) {
      await ctx.db.insert("notifications", {
        userId: adminId,
        type: "New Customer",
        title: "New Customer Created",
        message: `A new customer '${args.name}' has been created!`,
        link: `/admin/customers/${customerId}`,
        read: false,
        createdAt: Date.now(),
      });
    }
    await ctx.db.insert("notifications", {
      userId: customerId,
      type: "welcome",
      title: "Welcome to Star Beads Kreation!",
      message: `Hi ${args.name}, your account has been created successfully! To get started, please set your password.`,
      link: undefined,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, customerId };
  },
});

// Get all customers with analytics
export const getAllCustomersWithAnalytics = query({
  args: { includeAdmins: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // Filter users based on includeAdmins parameter
    let users;
    if (args.includeAdmins) {
      // Include all users (customers and admins)
      users = await ctx.db.query("users").collect();
    } else {
      // Only include customers
      users = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "customer"))
        .collect();
    }

    const orders = await ctx.db.query("orders").collect();

    // Get analytics for each customer
    const customersWithAnalytics = await Promise.all(
      users.map(async (user) => {
        const userOrders = orders.filter((order) => order.userId === user._id);
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const lastOrder =
          userOrders.length > 0
            ? Math.max(...userOrders.map((o) => o.createdAt))
            : null;

        return {
          ...user,
          analytics: {
            totalOrders,
            totalSpent,
            averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
            lastOrderDate: lastOrder ? new Date(lastOrder).toISOString() : null,
            orderHistory: userOrders.sort((a, b) => b.createdAt - a.createdAt),
          },
        };
      })
    );

    return customersWithAnalytics;
  },
});

// Get customer by ID with analytics
export const getCustomerById = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.customerId);
    if (!user) return null;

    const orders = await ctx.db.query("orders").collect();
    const userOrders = orders.filter((order) => order.userId === user._id);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder =
      userOrders.length > 0
        ? Math.max(...userOrders.map((o) => o.createdAt))
        : null;

    return {
      ...user,
      analytics: {
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: lastOrder ? new Date(lastOrder).toISOString() : null,
        orderHistory: userOrders.sort((a, b) => b.createdAt - a.createdAt),
      },
    };
  },
});

// Search customers
export const searchCustomers = query({
  args: {
    query: v.optional(v.string()),
    role: v.optional(v.string()),
    minOrders: v.optional(v.number()),
    maxOrders: v.optional(v.number()),
    minSpent: v.optional(v.number()),
    maxSpent: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("email"),
        v.literal("createdAt"),
        v.literal("totalOrders"),
        v.literal("totalSpent")
      )
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    // Start with customers only, unless specifically searching for admins
    let users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "customer"))
      .collect();
    const orders = await ctx.db.query("orders").collect();

    // If role filter is specified and includes admins, fetch all users
    if (args.role && args.role !== "customer") {
      users = await ctx.db.query("users").collect();
    }

    // Filter by search query
    if (args.query) {
      const query = args.query.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.contact && user.contact.toLowerCase().includes(query))
      );
    }

    // Filter by role
    if (args.role) {
      users = users.filter((user) => user.role === args.role);
    }

    // Get analytics and apply filters
    const customersWithAnalytics = await Promise.all(
      users.map(async (user) => {
        const userOrders = orders.filter((order) => order.userId === user._id);
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const lastOrder =
          userOrders.length > 0
            ? Math.max(...userOrders.map((o) => o.createdAt))
            : null;

        return {
          ...user,
          analytics: {
            totalOrders,
            totalSpent,
            averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
            lastOrderDate: lastOrder ? new Date(lastOrder).toISOString() : null,
            orderHistory: userOrders.sort((a, b) => b.createdAt - a.createdAt),
          },
        };
      })
    );

    // Apply analytics filters
    let filteredCustomers = customersWithAnalytics;

    if (args.minOrders !== undefined) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.analytics.totalOrders >= args.minOrders!
      );
    }
    if (args.maxOrders !== undefined) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.analytics.totalOrders <= args.maxOrders!
      );
    }
    if (args.minSpent !== undefined) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.analytics.totalSpent >= args.minSpent!
      );
    }
    if (args.maxSpent !== undefined) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.analytics.totalSpent <= args.maxSpent!
      );
    }

    // Sort customers
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    filteredCustomers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "totalOrders":
          aValue = a.analytics.totalOrders;
          bValue = b.analytics.totalOrders;
          break;
        case "totalSpent":
          aValue = a.analytics.totalSpent;
          bValue = b.analytics.totalSpent;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredCustomers;
  },
});

// Get customer statistics
export const getCustomerStats = query({
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
    // Only count customers, not admins
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "customer"))
      .collect();
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

    const totalCustomers = users.length;
    const customersWithOrders = users.filter((user) =>
      orders.some((order) => order.userId === user._id)
    ).length;

    const newCustomers = users.filter((user) => {
      if (args.period) {
        const periods = {
          today: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        };
        const cutoff = now - periods[args.period];
        return user.createdAt >= cutoff;
      }
      return false;
    }).length;

    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const averageOrderValue =
      filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    // Customer segments
    const customerSegments = users.map((user) => {
      const userOrders = orders.filter((order) => order.userId === user._id);
      const totalSpent = userOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );

      if (totalSpent >= 500) return "VIP";
      if (totalSpent >= 100) return "Regular";
      if (userOrders.length > 0) return "New";
      return "Inactive";
    });

    const segmentCounts = customerSegments.reduce(
      (acc, segment) => {
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCustomers,
      customersWithOrders,
      newCustomers,
      totalRevenue,
      averageOrderValue,
      segmentCounts,
    };
  },
});

// Update customer information
export const updateCustomer = mutation({
  args: {
    customerId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    contact: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("customer"))),
  },
  handler: async (ctx, args) => {
    const { customerId, ...updates } = args;
    await ctx.db.patch(customerId, updates);
    return { success: true };
  },
});

// Delete customer (admin only)
export const deleteCustomer = mutation({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    // Note: In a real app, you might want to soft delete or archive instead
    await ctx.db.delete(args.customerId);
    return { success: true };
  },
});

// Get customer order history
export const getCustomerOrderHistory = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    const customerOrders = orders
      .filter((order) => order.userId === args.customerId)
      .sort((a, b) => b.createdAt - a.createdAt);

    return customerOrders;
  },
});

// Get top customers by revenue
export const getTopCustomers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const users = await ctx.db.query("users").collect();
    const orders = await ctx.db.query("orders").collect();

    const customersWithRevenue = users.map((user) => {
      const userOrders = orders.filter((order) => order.userId === user._id);
      const totalRevenue = userOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const totalOrders = userOrders.length;

      return {
        ...user,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    });

    return customersWithRevenue
      .filter((c) => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },
});

// Get recent customers
export const getRecentCustomers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const users = await ctx.db.query("users").order("desc").take(limit);

    return users;
  },
});
