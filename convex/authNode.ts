"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "node:crypto";
import { api } from "./_generated/api";

// Request password reset (Node.js runtime)
export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.authMutations.findUserByEmail, { email: args.email });
    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    await ctx.runMutation(api.authMutations.updateUserResetToken, {
      userId: user._id,
      resetToken: token,
      resetTokenExpires: expires,
    });
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/reset?token=${token}`;
    // Send email with link
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY);
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [user.email],
        subject: "Password Reset Request",
        html: `<p>Hello${user.name ? ` ${user.name}` : ""},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p><a href='${resetLink}'>Reset your password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Thanks,<br/>Flow Stores Team</p>`
      });
    } catch (e) {
      console.error("Failed to send password reset email", e);
    }
    return { success: true };
  },
}); 