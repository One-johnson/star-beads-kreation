"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, School, GraduationCap, User, Users } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student" | "parent">("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { setSessionToken } = useAuth();
  const login = useAction(api.authNode.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      setSessionToken(result.sessionToken);
      
      // Redirect based on role
      switch (result.user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "teacher":
          router.push("/teacher/dashboard");
          break;
        case "student":
          router.push("/student/dashboard");
          break;
        case "parent":
          router.push("/parent/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfig = {
    admin: {
      title: "Administrator",
      description: "School administration and management",
      icon: School,
      color: "bg-red-500",
    },
    teacher: {
      title: "Teacher",
      description: "Class management and grading",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    student: {
      title: "Student",
      description: "View grades and attendance",
      icon: User,
      color: "bg-green-500",
    },
    parent: {
      title: "Parent",
      description: "Monitor child's progress",
      icon: Users,
      color: "bg-purple-500",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">School Management System</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Choose your role and sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(value) => setRole(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
                <TabsTrigger value="teacher" className="text-xs">Teacher</TabsTrigger>
                <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
                <TabsTrigger value="parent" className="text-xs">Parent</TabsTrigger>
              </TabsList>

              {Object.entries(roleConfig).map(([roleKey, config]) => (
                <TabsContent key={roleKey} value={roleKey} className="mt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${config.color} text-white`}>
                      <config.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-1">{config.title}</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">{config.description}</p>
                </TabsContent>
              ))}
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  Contact administrator
                </Link>
              </p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Demo Credentials:</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <p><strong>Admin:</strong> admin@school.com / admin123</p>
                <p><strong>Teacher:</strong> sarah.johnson@school.com / teacher123</p>
                <p><strong>Student:</strong> alex.thompson@student.school.com / student123</p>
                <p><strong>Parent:</strong> john.thompson@parent.school.com / parent123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}