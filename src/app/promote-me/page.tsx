"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function PromoteMePage() {
  const { user } = useAuth();
  const updateUserRole = useMutation(api.authMutations.updateUserRole);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <div className="max-w-xl mx-auto p-8 text-center">Please sign in to promote yourself.</div>;
  }

  if ((user as any).role === "admin") {
    return <div className="max-w-xl mx-auto p-8 text-center">You are already an admin.</div>;
  }

  const handlePromote = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserRole({ userId: user.userId, role: "admin" });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Promote Me to Admin</h1>
      <p className="mb-4 text-muted-foreground">This is a one-time page to promote your account to admin. <b>Delete this page after use for security.</b></p>
      {success ? (
        <div className="text-green-600 font-semibold">You have been promoted to admin! Please refresh or re-login.</div>
      ) : (
        <Button onClick={handlePromote} disabled={loading}>
          {loading ? "Promoting..." : "Promote Me"}
        </Button>
      )}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
} 