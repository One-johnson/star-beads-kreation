"use node";
import { action, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { api } from "./_generated/api";

export const signUp = action({
  args: { 
    email: v.string(), 
    name: v.string(), 
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
    contact: v.optional(v.string()) 
  },
  handler: async (ctx: ActionCtx, args): Promise<{ userId: string }> => {
    const existing = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (existing) throw new Error("Email already registered");
    
    const userId: string = await ctx.runMutation(api.authMutations.createUser, {
      email: args.email,
      name: args.name,
      password: args.password,
      role: args.role,
      contact: args.contact,
    });
    
    return { userId };
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx: ActionCtx, args): Promise<{ sessionToken: string; user: any }> => {
    const user = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (!user || !user.isActive) throw new Error("Invalid email or password");
    
    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");
    
    const sessionToken = randomBytes(32).toString("hex");
    await ctx.runMutation(api.authMutations.createSession, {
      userId: user._id,
      sessionToken,
    });
    
    return { 
      sessionToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        avatar: user.avatar,
      }
    };
  },
});

export const logout = action({
  args: { sessionToken: v.string() },
  handler: async (ctx: ActionCtx, args): Promise<{ success: boolean }> => {
    const session = await ctx.runQuery(api.authMutations.findSessionByToken, { sessionToken: args.sessionToken });
    if (session) {
      await ctx.runMutation(api.authMutations.deleteSession, { sessionId: session._id });
    }
    return { success: true };
  },
});

export const resetPassword = action({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx: ActionCtx, args): Promise<{ success: boolean }> => {
    const user = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < Date.now()
    ) {
      throw new Error("Invalid or expired reset token");
    }
    
    const passwordHash = await bcrypt.hash(args.newPassword, 10);
    await ctx.runMutation(api.authMutations.updateUserResetToken, {
      userId: user._id,
      passwordHash,
      resetToken: undefined,
      resetTokenExpires: undefined,
    });
    
    return { success: true };
  },
});

export const forgotPassword = action({
  args: { email: v.string() },
  handler: async (ctx: ActionCtx, args): Promise<{ success: boolean }> => {
    const user = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (!user) {
      // Don't reveal if email exists or not
      return { success: true };
    }
    
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await ctx.runMutation(api.authMutations.updateUserResetToken, {
      userId: user._id,
      resetToken,
      resetTokenExpires,
    });
    
    // TODO: Send email with reset link
    // await ctx.scheduler.runAfter(0, api.emailActions.sendPasswordResetEmail, {
    //   email: args.email,
    //   resetToken,
    // });
    
    return { success: true };
  },
}); 