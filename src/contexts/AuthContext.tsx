"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student" | "parent";
  contact?: string;
  avatar?: string;
}

interface Student {
  _id: Id<"students">;
  userId: Id<"users">;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  academicYear: string;
  parentId?: Id<"users">;
}

interface Teacher {
  _id: Id<"teachers">;
  userId: Id<"users">;
  teacherId: string;
  firstName: string;
  lastName: string;
  qualification: string;
  specialization: string[];
}

interface AuthContextType {
  user: User | null;
  student: Student | null;
  teacher: Teacher | null;
  sessionToken: string | null;
  isLoading: boolean;
  setSessionToken: (token: string | null) => void;
  hasRole: (roles: string[]) => boolean;
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
  const user = useQuery(api.auth.getUser, sessionToken ? { sessionToken } : "skip");

  // Get student profile if user is a student
  const student = useQuery(
    api.authMutations.getStudentByUserId,
    user && user.role === "student" ? { userId: user._id } : "skip"
  );

  // Get teacher profile if user is a teacher
  const teacher = useQuery(
    api.authMutations.getTeacherByUserId,
    user && user.role === "teacher" ? { userId: user._id } : "skip"
  );

  const handleSetSessionToken = (token: string | null) => {
    setSessionToken(token);
    if (token) {
      localStorage.setItem("sessionToken", token);
    } else {
      localStorage.removeItem("sessionToken");
    }
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      student: student || null,
      teacher: teacher || null,
      sessionToken,
      isLoading,
      setSessionToken: handleSetSessionToken,
      hasRole,
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