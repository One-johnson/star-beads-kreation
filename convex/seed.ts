import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Create academic year
    const academicYear = await ctx.db.insert("academicYears", {
      name: "2024-2025",
      startDate: new Date("2024-09-01").getTime(),
      endDate: new Date("2025-06-30").getTime(),
      isActive: true,
      createdAt: Date.now(),
    });

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminUser = await ctx.db.insert("users", {
      name: "School Administrator",
      email: "admin@school.com",
      passwordHash,
      role: "admin",
      contact: "+1234567890",
      createdAt: Date.now(),
      isActive: true,
    });

    // Create school settings
    await ctx.db.insert("schoolSettings", {
      schoolName: "Excellence Academy",
      address: "123 Education Street, Learning City, LC 12345",
      phone: "+1 (555) 123-4567",
      email: "info@excellenceacademy.edu",
      website: "https://excellenceacademy.edu",
      academicYear: "2024-2025",
      settings: {
        attendanceThreshold: 85,
        gradingScale: {
          A: 90,
          B: 80,
          C: 70,
          D: 60,
          F: 0,
        },
        feeDueReminderDays: 7,
      },
      updatedAt: Date.now(),
    });

    // Create subjects
    const subjects = [
      {
        name: "Mathematics",
        code: "MATH101",
        description: "Advanced Mathematics for High School",
        grade: "Grade 10",
        credits: 4,
      },
      {
        name: "English Literature",
        code: "ENG101",
        description: "English Literature and Composition",
        grade: "Grade 10",
        credits: 4,
      },
      {
        name: "Physics",
        code: "PHY101",
        description: "Introduction to Physics",
        grade: "Grade 10",
        credits: 4,
      },
      {
        name: "History",
        code: "HIS101",
        description: "World History",
        grade: "Grade 10",
        credits: 3,
      },
      {
        name: "Biology",
        code: "BIO101",
        description: "Introduction to Biology",
        grade: "Grade 10",
        credits: 4,
      },
      {
        name: "Computer Science",
        code: "CS101",
        description: "Introduction to Programming",
        grade: "Grade 10",
        credits: 3,
      },
    ];

    const subjectIds = [];
    for (const subject of subjects) {
      const subjectId = await ctx.db.insert("subjects", {
        ...subject,
        isActive: true,
        createdAt: Date.now(),
      });
      subjectIds.push(subjectId);
    }

    // Create teacher users and profiles
    const teachers = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@school.com",
        password: "teacher123",
        firstName: "Sarah",
        lastName: "Johnson",
        teacherId: "T001",
        qualification: "Ph.D. in Mathematics",
        specialization: ["Mathematics", "Statistics"],
        phone: "+1 (555) 111-1111",
        address: "456 Teacher Lane, Learning City, LC 12345",
        dateOfBirth: "1985-03-15",
        gender: "female",
      },
      {
        name: "Mr. Michael Chen",
        email: "michael.chen@school.com",
        password: "teacher123",
        firstName: "Michael",
        lastName: "Chen",
        teacherId: "T002",
        qualification: "M.A. in English Literature",
        specialization: ["English Literature", "Creative Writing"],
        phone: "+1 (555) 222-2222",
        address: "789 Educator Ave, Learning City, LC 12345",
        dateOfBirth: "1988-07-22",
        gender: "male",
      },
      {
        name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@school.com",
        password: "teacher123",
        firstName: "Emily",
        lastName: "Rodriguez",
        teacherId: "T003",
        qualification: "Ph.D. in Physics",
        specialization: ["Physics", "Mathematics"],
        phone: "+1 (555) 333-3333",
        address: "321 Science St, Learning City, LC 12345",
        dateOfBirth: "1982-11-08",
        gender: "female",
      },
    ];

    const teacherIds = [];
    for (const teacher of teachers) {
      const passwordHash = await bcrypt.hash(teacher.password, 10);
      
      const teacherUser = await ctx.db.insert("users", {
        name: teacher.name,
        email: teacher.email,
        passwordHash,
        role: "teacher",
        contact: teacher.phone,
        createdAt: Date.now(),
        isActive: true,
      });

      const teacherProfile = await ctx.db.insert("teachers", {
        userId: teacherUser,
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        dateOfBirth: teacher.dateOfBirth,
        gender: teacher.gender,
        address: teacher.address,
        phone: teacher.phone,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        hireDate: Date.now(),
        isActive: true,
      });

      teacherIds.push(teacherProfile);
    }

    // Create classes
    const classes = [
      {
        name: "Grade 10-A",
        grade: "Grade 10",
        section: "A",
        capacity: 30,
        classTeacherId: teacherIds[0], // Dr. Sarah Johnson
      },
      {
        name: "Grade 10-B",
        grade: "Grade 10",
        section: "B",
        capacity: 30,
        classTeacherId: teacherIds[1], // Mr. Michael Chen
      },
      {
        name: "Grade 10-C",
        grade: "Grade 10",
        section: "C",
        capacity: 30,
        classTeacherId: teacherIds[2], // Dr. Emily Rodriguez
      },
    ];

    const classIds = [];
    for (const cls of classes) {
      const classId = await ctx.db.insert("classes", {
        ...cls,
        academicYear: "2024-2025",
        currentEnrollment: 0,
        isActive: true,
        createdAt: Date.now(),
      });
      classIds.push(classId);
    }

    // Assign subjects to classes
    const classSubjectAssignments = [
      {
        classId: classIds[0],
        subjectId: subjectIds[0], // Math
        teacherId: teacherIds[0],
        schedule: [
          { day: "monday", startTime: "08:00", endTime: "09:00", room: "Room 101" },
          { day: "wednesday", startTime: "08:00", endTime: "09:00", room: "Room 101" },
          { day: "friday", startTime: "08:00", endTime: "09:00", room: "Room 101" },
        ],
      },
      {
        classId: classIds[0],
        subjectId: subjectIds[1], // English
        teacherId: teacherIds[1],
        schedule: [
          { day: "monday", startTime: "09:15", endTime: "10:15", room: "Room 102" },
          { day: "wednesday", startTime: "09:15", endTime: "10:15", room: "Room 102" },
          { day: "friday", startTime: "09:15", endTime: "10:15", room: "Room 102" },
        ],
      },
      {
        classId: classIds[0],
        subjectId: subjectIds[2], // Physics
        teacherId: teacherIds[2],
        schedule: [
          { day: "tuesday", startTime: "08:00", endTime: "09:00", room: "Lab 201" },
          { day: "thursday", startTime: "08:00", endTime: "09:00", room: "Lab 201" },
        ],
      },
    ];

    for (const assignment of classSubjectAssignments) {
      await ctx.db.insert("classSubjects", {
        ...assignment,
        academicYear: "2024-2025",
        isActive: true,
      });
    }

    // Create sample student users and profiles
    const students = [
      {
        name: "Alex Thompson",
        email: "alex.thompson@student.school.com",
        password: "student123",
        firstName: "Alex",
        lastName: "Thompson",
        studentId: "S001",
        grade: "Grade 10",
        section: "A",
        phone: "+1 (555) 444-4444",
        address: "123 Student St, Learning City, LC 12345",
        dateOfBirth: "2008-05-12",
        gender: "male",
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@student.school.com",
        password: "student123",
        firstName: "Maria",
        lastName: "Garcia",
        studentId: "S002",
        grade: "Grade 10",
        section: "A",
        phone: "+1 (555) 555-5555",
        address: "456 Learner Ave, Learning City, LC 12345",
        dateOfBirth: "2008-08-20",
        gender: "female",
      },
    ];

    for (const student of students) {
      const passwordHash = await bcrypt.hash(student.password, 10);
      
      const studentUser = await ctx.db.insert("users", {
        name: student.name,
        email: student.email,
        passwordHash,
        role: "student",
        contact: student.phone,
        createdAt: Date.now(),
        isActive: true,
      });

      const studentProfile = await ctx.db.insert("students", {
        userId: studentUser,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        phone: student.phone,
        emergencyContact: {
          name: `${student.firstName} Parent`,
          relationship: "Parent",
          phone: student.phone,
        },
        enrollmentDate: Date.now(),
        grade: student.grade,
        section: student.section,
        academicYear: "2024-2025",
        isActive: true,
      });

      // Enroll student in class
      await ctx.db.insert("enrollments", {
        studentId: studentProfile,
        classId: classIds[0], // Grade 10-A
        academicYear: "2024-2025",
        enrollmentDate: Date.now(),
        status: "active",
      });

      // Update class enrollment count
      const classInfo = await ctx.db.get(classIds[0]);
      if (classInfo) {
        await ctx.db.patch(classIds[0], {
          currentEnrollment: classInfo.currentEnrollment + 1,
        });
      }
    }

    // Create parent user
    const parentPasswordHash = await bcrypt.hash("parent123", 10);
    const parentUser = await ctx.db.insert("users", {
      name: "John Thompson",
      email: "john.thompson@parent.school.com",
      passwordHash: parentPasswordHash,
      role: "parent",
      contact: "+1 (555) 666-6666",
      createdAt: Date.now(),
      isActive: true,
    });

    // Link parent to student (Alex Thompson)
    const alexStudent = await ctx.db
      .query("students")
      .withIndex("by_studentId", (q) => q.eq("studentId", "S001"))
      .first();

    if (alexStudent) {
      await ctx.db.patch(alexStudent._id, {
        parentId: parentUser,
      });
    }

    return {
      message: "Database seeded successfully",
      academicYear,
      adminUser,
      teacherIds,
      classIds,
      subjectIds,
    };
  },
}); 