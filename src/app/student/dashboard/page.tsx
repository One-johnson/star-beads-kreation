"use client";
import { useQuery } from "convex/react";
import { api } from "@/../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  School
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const currentYear = "2024-2025";
  
  // Get student's grades
  const grades = useQuery(
    api.school.getStudentGrades,
    student ? { studentId: student._id, academicYear: currentYear } : "skip"
  );

  // Get student's attendance
  const attendance = useQuery(
    api.school.getStudentAttendance,
    student ? { 
      studentId: student._id, 
      startDate: "2024-01-01", 
      endDate: "2024-12-31" 
    } : "skip"
  );

  // Sample data for charts
  const gradeData = [
    { subject: "Math", grade: 85 },
    { subject: "English", grade: 92 },
    { subject: "Physics", grade: 78 },
    { subject: "History", grade: 88 },
    { subject: "Biology", grade: 90 },
  ];

  const attendanceData = [
    { month: "Jan", present: 22, absent: 2 },
    { month: "Feb", present: 20, absent: 3 },
    { month: "Mar", present: 18, absent: 5 },
    { month: "Apr", present: 21, absent: 1 },
    { month: "May", present: 23, absent: 0 },
    { month: "Jun", present: 19, absent: 4 },
  ];

  const todaySchedule = [
    { time: "08:00 - 09:00", subject: "Mathematics", teacher: "Dr. Sarah Johnson", room: "Room 101" },
    { time: "09:15 - 10:15", subject: "English Literature", teacher: "Mr. Michael Chen", room: "Room 102" },
    { time: "10:30 - 11:30", subject: "Physics", teacher: "Dr. Emily Rodriguez", room: "Lab 201" },
    { time: "11:45 - 12:45", subject: "History", teacher: "Ms. Lisa Wang", room: "Room 103" },
  ];

  const recentGrades = [
    { subject: "Mathematics", assessment: "Midterm Exam", grade: 85, maxGrade: 100, date: "2024-01-15" },
    { subject: "English Literature", assessment: "Essay Assignment", grade: 92, maxGrade: 100, date: "2024-01-12" },
    { subject: "Physics", assessment: "Lab Report", grade: 78, maxGrade: 100, date: "2024-01-10" },
  ];

  if (!user || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const attendanceRate = attendance ? 
    (attendance.filter(a => a.status === "present").length / attendance.length * 100).toFixed(1) : 0;

  const averageGrade = grades ? 
    (grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {student.firstName}! Here's your academic overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {student.grade} - Section {student.section}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Student ID: {student.studentId}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySchedule.length}</div>
            <p className="text-xs text-muted-foreground">
              Next: Mathematics at 08:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-xs text-muted-foreground">
              Above average performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Grades</CardTitle>
            <CardDescription>Your performance across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grade" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
            <CardDescription>Your attendance record over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule and Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((class_, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{class_.subject}</p>
                    <p className="text-xs text-gray-500">{class_.teacher} • {class_.room}</p>
                  </div>
                  <div className="text-sm text-gray-500">{class_.time}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>Your latest assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{grade.subject}</p>
                    <p className="text-xs text-gray-500">{grade.assessment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {grade.grade}/{grade.maxGrade}
                    </p>
                    <p className="text-xs text-gray-500">{grade.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Grades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common student tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/student/grades">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">View Grades</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/student/attendance">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Attendance</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/student/schedule">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Schedule</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/student/messages">
                <User className="h-5 w-5" />
                <span className="text-sm">Messages</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Important updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Grade Updated</p>
                <p className="text-xs text-blue-700">Your Mathematics midterm grade has been posted</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Attendance Recorded</p>
                <p className="text-xs text-green-700">Your attendance for today has been marked as present</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Assignment Due</p>
                <p className="text-xs text-yellow-700">Physics lab report due in 2 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}