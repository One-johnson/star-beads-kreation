import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User authentication and basic info
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
    contact: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    resetToken: v.optional(v.string()),
    resetTokenExpires: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_resetToken", ["resetToken"]),

  // Student profiles
  students: defineTable({
    userId: v.id("users"),
    studentId: v.string(), // Unique student ID
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    phone: v.string(),
    emergencyContact: v.object({
      name: v.string(),
      relationship: v.string(),
      phone: v.string(),
    }),
    enrollmentDate: v.number(),
    grade: v.string(), // e.g., "Grade 10", "Grade 11"
    section: v.string(), // e.g., "A", "B", "C"
    parentId: v.optional(v.id("users")), // Link to parent account
    medicalInfo: v.optional(v.string()),
    academicYear: v.string(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_studentId", ["studentId"])
    .index("by_grade", ["grade"])
    .index("by_parent", ["parentId"])
    .index("by_academic_year", ["academicYear"]),

  // Teacher profiles
  teachers: defineTable({
    userId: v.id("users"),
    teacherId: v.string(), // Unique teacher ID
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    phone: v.string(),
    qualification: v.string(),
    specialization: v.array(v.string()), // Subjects they can teach
    hireDate: v.number(),
    salary: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_teacherId", ["teacherId"])
    .index("by_specialization", ["specialization"]),

  // Subjects
  subjects: defineTable({
    name: v.string(),
    code: v.string(), // Subject code like "MATH101"
    description: v.string(),
    grade: v.string(), // Which grade this subject is for
    credits: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_grade", ["grade"]),

  // Classes (combinations of grade and section)
  classes: defineTable({
    name: v.string(), // e.g., "Grade 10-A"
    grade: v.string(),
    section: v.string(),
    academicYear: v.string(),
    classTeacherId: v.optional(v.id("teachers")),
    capacity: v.number(),
    currentEnrollment: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_grade_section", ["grade", "section"])
    .index("by_academic_year", ["academicYear"])
    .index("by_teacher", ["classTeacherId"]),

  // Class-Subject assignments
  classSubjects: defineTable({
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    teacherId: v.id("teachers"),
    schedule: v.array(
      v.object({
        day: v.union(
          v.literal("monday"),
          v.literal("tuesday"),
          v.literal("wednesday"),
          v.literal("thursday"),
          v.literal("friday"),
          v.literal("saturday"),
          v.literal("sunday")
        ),
        startTime: v.string(), // "09:00"
        endTime: v.string(), // "10:00"
        room: v.optional(v.string()),
      })
    ),
    academicYear: v.string(),
    isActive: v.boolean(),
  })
    .index("by_class", ["classId"])
    .index("by_subject", ["subjectId"])
    .index("by_teacher", ["teacherId"])
    .index("by_academic_year", ["academicYear"]),

  // Student-Class enrollments
  enrollments: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    academicYear: v.string(),
    enrollmentDate: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("graduated"),
      v.literal("transferred")
    ),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"])
    .index("by_academic_year", ["academicYear"]),

  // Attendance tracking
  attendance: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    date: v.string(), // YYYY-MM-DD format
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    markedBy: v.id("teachers"),
    remarks: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"])
    .index("by_subject", ["subjectId"])
    .index("by_date", ["date"])
    .index("by_student_date", ["studentId", "date"]),

  // Grades and assessments
  grades: defineTable({
    studentId: v.id("students"),
    subjectId: v.id("subjects"),
    classId: v.id("classes"),
    assessmentType: v.union(
      v.literal("assignment"),
      v.literal("quiz"),
      v.literal("midterm"),
      v.literal("final"),
      v.literal("project")
    ),
    title: v.string(),
    score: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    remarks: v.optional(v.string()),
    gradedBy: v.id("teachers"),
    gradedAt: v.number(),
    academicYear: v.string(),
  })
    .index("by_student", ["studentId"])
    .index("by_subject", ["subjectId"])
    .index("by_class", ["classId"])
    .index("by_assessment_type", ["assessmentType"])
    .index("by_academic_year", ["academicYear"])
    .index("by_student_subject", ["studentId", "subjectId"]),

  // Fees management
  fees: defineTable({
    studentId: v.id("students"),
    feeType: v.union(
      v.literal("tuition"),
      v.literal("transport"),
      v.literal("library"),
      v.literal("laboratory"),
      v.literal("sports"),
      v.literal("other")
    ),
    amount: v.number(),
    dueDate: v.number(),
    paidAmount: v.number(),
    paidDate: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    academicYear: v.string(),
    remarks: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_academic_year", ["academicYear"])
    .index("by_due_date", ["dueDate"]),

  // Messages and announcements
  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")), // null for announcements
    recipientType: v.optional(
      v.union(
        v.literal("all"),
        v.literal("students"),
        v.literal("teachers"),
        v.literal("parents"),
        v.literal("specific")
      )
    ),
    subject: v.string(),
    content: v.string(),
    messageType: v.union(
      v.literal("announcement"),
      v.literal("message"),
      v.literal("notification")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["messageType"])
    .index("by_created", ["createdAt"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // e.g., "grade", "attendance", "fee", "message"
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Sessions for authentication
  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["sessionToken"]),

  // Academic years
  academicYears: defineTable({
    name: v.string(), // e.g., "2024-2025"
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  // School settings
  schoolSettings: defineTable({
    schoolName: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    academicYear: v.string(),
    settings: v.object({
      attendanceThreshold: v.optional(v.number()), // Minimum attendance percentage
      gradingScale: v.optional(v.object({
        A: v.number(),
        B: v.number(),
        C: v.number(),
        D: v.number(),
        F: v.number(),
      })),
      feeDueReminderDays: v.optional(v.number()),
    }),
    updatedAt: v.number(),
  }).index("by_academic_year", ["academicYear"]),
});
