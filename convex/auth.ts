"use node";
import { action, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { api } from "./_generated/api";

export const signUp = action({
  args: { email: v.string(), name: v.string(), contact: v.string(), password: v.string() },
  handler: async (ctx: ActionCtx, args: { email: string; name: string; contact: string; password: string }): Promise<{ userId: string }> => {
    const existing = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (existing) throw new Error("Email already registered");
    const passwordHash = await bcrypt.hash(args.password, 10);
    const userId: string = await ctx.runMutation(api.authMutations.createUser, {
      email: args.email,
      name: args.name,
      contact: args.contact,
      passwordHash,
    });
    return { userId };
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx: ActionCtx, args: { email: string; password: string }): Promise<{ sessionToken: string }> => {
    const user = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (!user) throw new Error("Invalid email or password");
    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");
    const sessionToken = randomBytes(32).toString("hex");
    await ctx.runMutation(api.authMutations.createSession, {
      userId: user._id,
      sessionToken,
    });
    return { sessionToken };
  },
});

export const logout = action({
  args: { sessionToken: v.string() },
  handler: async (ctx: ActionCtx, args: { sessionToken: string }): Promise<{ success: boolean }> => {
    const session = await ctx.runQuery(api.authMutations.findSessionByToken, { sessionToken: args.sessionToken });
    if (session) {
      await ctx.runMutation(api.authMutations.deleteSession, { sessionId: session._id });
    }
    return { success: true };
  },
}); 