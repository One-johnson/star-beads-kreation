"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const resetPassword = useMutation(api.authMutations.resetPassword);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await resetPassword({ token, newPassword: password });
      toast.success("Password reset! You can now log in.");
      router.push("/auth");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return <div className="max-w-md mx-auto mt-16 text-center text-red-600">Invalid or missing reset token.</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-muted rounded-lg shadow p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full text-base"
          required
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </main>
  );
} 