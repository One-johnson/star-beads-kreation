import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Message Management
export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")),
    recipientType: v.optional(
      v.union(
        v.literal("all"),
        v.literal("students"),
        v.literal("teachers"),
        v.literal("parents"),
        v.literal("specific")
      )
    ),
    subject: v.string(),
    content: v.string(),
    messageType: v.union(
      v.literal("announcement"),
      v.literal("message"),
      v.literal("notification")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      subject: args.subject,
      content: args.content,
      messageType: args.messageType,
      priority: args.priority,
      isRead: false,
      createdAt: Date.now(),
    });

    // Create notifications for recipients
    if (args.recipientId) {
      // Direct message
      await ctx.db.insert("notifications", {
        userId: args.recipientId,
        type: "message",
        title: "New Message",
        message: `You have a new message: ${args.subject}`,
        link: `/messages/${messageId}`,
        read: false,
        createdAt: Date.now(),
      });
    } else if (args.recipientType) {
      // Announcement or broadcast message
      let users: any[] = [];
      
      switch (args.recipientType) {
        case "all":
          users = await ctx.db.query("users").filter((q) => q.eq(q.field("isActive"), true)).collect();
          break;
        case "students":
          const students = await ctx.db.query("students").filter((q) => q.eq(q.field("isActive"), true)).collect();
          users = await Promise.all(students.map(async (student) => await ctx.db.get(student.userId)));
          break;
        case "teachers":
          const teachers = await ctx.db.query("teachers").filter((q) => q.eq(q.field("isActive"), true)).collect();
          users = await Promise.all(teachers.map(async (teacher) => await ctx.db.get(teacher.userId)));
          break;
        case "parents":
          users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "parent")).collect();
          break;
      }

      // Create notifications for all recipients
      for (const user of users) {
        if (user && user.isActive) {
          await ctx.db.insert("notifications", {
            userId: user._id,
            type: args.messageType,
            title: args.subject,
            message: args.content,
            link: `/messages/${messageId}`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    return messageId;
  },
});

export const getMessages = query({
  args: {
    userId: v.id("users"),
    messageType: v.optional(v.union(
      v.literal("announcement"),
      v.literal("message"),
      v.literal("notification")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let messagesQuery = ctx.db.query("messages");

    // Filter by recipient or recipient type
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    let messages: any[] = [];

    // Get direct messages
    const directMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.userId))
      .collect();

    // Get announcements based on user role
    const announcements = await ctx.db
      .query("messages")
      .withIndex("by_type", (q) => q.eq("messageType", "announcement"))
      .filter((q) => 
        q.or(
          q.eq(q.field("recipientType"), "all"),
          q.eq(q.field("recipientType"), user.role === "student" ? "students" : 
               user.role === "teacher" ? "teachers" : 
               user.role === "parent" ? "parents" : "all")
        )
      )
      .collect();

    messages = [...directMessages, ...announcements];

    // Sort by creation date (newest first)
    messages.sort((a, b) => b.createdAt - a.createdAt);

    // Apply message type filter
    if (args.messageType) {
      messages = messages.filter(msg => msg.messageType === args.messageType);
    }

    // Apply limit
    if (args.limit) {
      messages = messages.slice(0, args.limit);
    }

    // Get sender details
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        
        return {
          ...message,
          sender: sender ? {
            _id: sender._id,
            name: sender.name,
            email: sender.email,
            role: sender.role,
          } : null,
        };
      })
    );

    return messagesWithSenders;
  },
});

export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

// Notification Management
export const getNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.limit) {
      notificationsQuery = notificationsQuery.take(args.limit);
    }

    const notifications = await notificationsQuery.collect();
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    return notifications;
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const getUnreadNotificationCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return notifications.length;
  },
});

// System Notifications
export const createSystemNotification = mutation({
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

// Bulk notifications for events
export const notifyGradeUpdate = mutation({
  args: {
    studentId: v.id("students"),
    subjectName: v.string(),
    assessmentTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return;

    // Notify student
    await ctx.db.insert("notifications", {
      userId: student.userId,
      type: "grade",
      title: "Grade Updated",
      message: `Your grade for ${args.assessmentTitle} in ${args.subjectName} has been updated.`,
      link: "/grades",
      read: false,
      createdAt: Date.now(),
    });

    // Notify parent if exists
    if (student.parentId) {
      await ctx.db.insert("notifications", {
        userId: student.parentId,
        type: "grade",
        title: "Grade Update",
        message: `${student.firstName} ${student.lastName}'s grade for ${args.assessmentTitle} in ${args.subjectName} has been updated.`,
        link: "/grades",
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const notifyAttendanceUpdate = mutation({
  args: {
    studentId: v.id("students"),
    date: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return;

    // Notify parent if attendance is marked as absent or late
    if (student.parentId && (args.status === "absent" || args.status === "late")) {
      await ctx.db.insert("notifications", {
        userId: student.parentId,
        type: "attendance",
        title: "Attendance Alert",
        message: `${student.firstName} ${student.lastName} was marked as ${args.status} on ${args.date}.`,
        link: "/attendance",
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const notifyFeeDue = mutation({
  args: {
    studentId: v.id("students"),
    feeType: v.string(),
    amount: v.number(),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return;

    // Notify parent
    if (student.parentId) {
      await ctx.db.insert("notifications", {
        userId: student.parentId,
        type: "fee",
        title: "Fee Due Reminder",
        message: `${student.firstName} ${student.lastName} has a ${args.feeType} fee of $${args.amount} due on ${new Date(args.dueDate).toLocaleDateString()}.`,
        link: "/fees",
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});