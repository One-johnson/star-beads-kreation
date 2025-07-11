"use client";
import React from "react";
import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white dark:bg-muted rounded-lg shadow p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sign In or Create an Account</h1>
          <p className="text-muted-foreground text-sm">Access your account to place orders, view your cart, and more.</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
} 