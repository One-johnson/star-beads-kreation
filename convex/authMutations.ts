import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";

// User queries
export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const findSessionByToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
  },
});

// User mutations
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
    contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(args.password, 10);

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash,
      role: args.role,
      contact: args.contact,
      createdAt: Date.now(),
      isActive: true,
    });

    return userId;
  },
});

export const createSession = mutation({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionToken: args.sessionToken,
      createdAt: Date.now(),
    });
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});

// Student management
export const createStudent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.string(),
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
    grade: v.string(),
    section: v.string(),
    parentId: v.optional(v.id("users")),
    medicalInfo: v.optional(v.string()),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();

    if (existingStudent) {
      throw new ConvexError("Student ID already exists");
    }

    return await ctx.db.insert("students", {
      userId: args.userId,
      studentId: args.studentId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      address: args.address,
      phone: args.phone,
      emergencyContact: args.emergencyContact,
      enrollmentDate: Date.now(),
      grade: args.grade,
      section: args.section,
      parentId: args.parentId,
      medicalInfo: args.medicalInfo,
      academicYear: args.academicYear,
      isActive: true,
    });
  },
});

export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      relationship: v.string(),
      phone: v.string(),
    })),
    grade: v.optional(v.string()),
    section: v.optional(v.string()),
    medicalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    await ctx.db.patch(studentId, updates);
  },
});

export const getStudentByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Teacher management
export const createTeacher = mutation({
  args: {
    userId: v.id("users"),
    teacherId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    phone: v.string(),
    qualification: v.string(),
    specialization: v.array(v.string()),
    salary: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_teacherId", (q) => q.eq("teacherId", args.teacherId))
      .first();

    if (existingTeacher) {
      throw new ConvexError("Teacher ID already exists");
    }

    return await ctx.db.insert("teachers", {
      userId: args.userId,
      teacherId: args.teacherId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      address: args.address,
      phone: args.phone,
      qualification: args.qualification,
      specialization: args.specialization,
      hireDate: Date.now(),
      salary: args.salary,
      isActive: true,
    });
  },
});

export const updateTeacher = mutation({
  args: {
    teacherId: v.id("teachers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    qualification: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),
    salary: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { teacherId, ...updates } = args;
    await ctx.db.patch(teacherId, updates);
  },
});

export const getTeacherByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Class management
export const createClass = mutation({
  args: {
    name: v.string(),
    grade: v.string(),
    section: v.string(),
    academicYear: v.string(),
    classTeacherId: v.optional(v.id("teachers")),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    const existingClass = await ctx.db
      .query("classes")
      .withIndex("by_grade_section", (q) => 
        q.eq("grade", args.grade).eq("section", args.section)
      )
      .first();

    if (existingClass) {
      throw new ConvexError("Class already exists for this grade and section");
    }

    return await ctx.db.insert("classes", {
      name: args.name,
      grade: args.grade,
      section: args.section,
      academicYear: args.academicYear,
      classTeacherId: args.classTeacherId,
      capacity: args.capacity,
      currentEnrollment: 0,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getClasses = query({
  args: { academicYear: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_academic_year", (q) => q.eq("academicYear", args.academicYear))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Subject management
export const createSubject = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.string(),
    grade: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const existingSubject = await ctx.db
      .query("subjects")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingSubject) {
      throw new ConvexError("Subject code already exists");
    }

    return await ctx.db.insert("subjects", {
      name: args.name,
      code: args.code,
      description: args.description,
      grade: args.grade,
      credits: args.credits,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getSubjects = query({
  args: { grade: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.grade) {
      return await ctx.db
        .query("subjects")
        .withIndex("by_grade", (q) => q.eq("grade", args.grade))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    
    return await ctx.db
      .query("subjects")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Academic year management
export const createAcademicYear = mutation({
  args: {
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Deactivate all other academic years
    const existingYears = await ctx.db.query("academicYears").collect();
    for (const year of existingYears) {
      await ctx.db.patch(year._id, { isActive: false });
    }

    return await ctx.db.insert("academicYears", {
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getCurrentAcademicYear = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("academicYears")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
  },
});

// School settings
export const createSchoolSettings = mutation({
  args: {
    schoolName: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    academicYear: v.string(),
    settings: v.object({
      attendanceThreshold: v.optional(v.number()),
      gradingScale: v.optional(v.object({
        A: v.number(),
        B: v.number(),
        C: v.number(),
        D: v.number(),
        F: v.number(),
      })),
      feeDueReminderDays: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("schoolSettings", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const getSchoolSettings = query({
  args: { academicYear: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schoolSettings")
      .withIndex("by_academic_year", (q) => q.eq("academicYear", args.academicYear))
      .first();
  },
});
