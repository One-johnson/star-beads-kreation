"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  role: string;
  userId: Id<"users">;
  email: string;
  name: string;
  contact?: string;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  setSessionToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session token from localStorage on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
    setSessionToken(token);
    setIsLoading(false);
  }, []);

  // Get current user from Convex
  const user = useQuery(api.authQueries.getCurrentUser, sessionToken ? { sessionToken } : "skip");

  const handleSetSessionToken = (token: string | null) => {
    setSessionToken(token);
    if (token) {
      localStorage.setItem("sessionToken", token);
    } else {
      localStorage.removeItem("sessionToken");
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      sessionToken,
      isLoading,
      setSessionToken: handleSetSessionToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 