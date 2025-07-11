"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function AuthForm() {
  const signUp = useAction(api.auth.signUp);
  const login = useAction(api.auth.login);
  const logoutAction = useAction(api.auth.logout);
  const { user, setSessionToken } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [contact, setContact] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        await signUp({ email, name, contact, password });
        // Auto-login after signup
        const result = await login({ email, password });
        setSessionToken(result.sessionToken);
      } else {
        const result = await login({ email, password });
        setSessionToken(result.sessionToken);
      }
      setEmail("");
      setName("");
      setPassword("");
      setContact("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const handleLogout = async () => {
    if (!user) return;
    setPending(true);
    setError(null);
    try {
      // Note: We need the sessionToken for logout, but we don't have it in the context
      // We'll need to get it from localStorage or modify the context
      const sessionToken = localStorage.getItem("sessionToken");
      if (sessionToken) {
        await logoutAction({ sessionToken });
      }
      setSessionToken(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setPending(false);
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div>Signed in as <span className="font-semibold">{user.name || user.email}</span></div>
        <Button onClick={handleLogout} disabled={pending}>Logout</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm w-full mx-auto">
      <h2 className="text-xl font-bold text-center mb-2">{mode === "login" ? "Login" : "Sign Up"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border rounded px-3 py-2 w-full text-base"
        required
      />
      {mode === "signup" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full text-base"
          required
        />
      )}
      {mode === "signup" && (
        <input
          type="text"
          placeholder="Contact (optional)"
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="border rounded px-3 py-2 w-full text-base"
        />
      )}
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full text-base pr-10"
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          onClick={() => setShowPassword(v => !v)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
      </Button>
      <div className="text-center text-sm">
        {mode === "login" ? (
          <span>
            Don&apos;t have an account?{' '}
            <button type="button" className="underline" onClick={() => setMode("signup")}>Sign Up</button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button type="button" className="underline" onClick={() => setMode("login")}>Login</button>
          </span>
        )}
      </div>
    </form>
  );
} 