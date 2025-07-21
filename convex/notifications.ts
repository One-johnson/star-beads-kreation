import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a notification
export const addNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Get notifications for a user (most recent first)
export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Mark a notification as read
export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllNotificationsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    for (const n of notifications) {
      if (!n.read) {
        await ctx.db.patch(n._id, { read: true });
      }
    }
    return { success: true };
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Delete all notifications for a user
export const deleteAllNotifications = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }
    return { success: true };
  },
}); 