"use node";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const getUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      avatar: user.avatar,
    };
  },
});

export const createSession = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessionToken = generateId();
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionToken,
      createdAt: Date.now(),
    });
    return sessionToken;
  },
});

export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const isAuthenticated = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args);
    return user !== null;
  },
});

export const hasRole = query({
  args: { 
    sessionToken: v.string(),
    roles: v.array(v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ))
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args);
    if (!user) {
      return false;
    }
    return args.roles.includes(user.role);
  },
}); 