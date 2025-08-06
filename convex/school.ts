import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Attendance Management
export const markAttendance = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    date: v.string(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    markedBy: v.id("teachers"),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if attendance already marked for this student, class, subject, and date
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_student_date", (q) => 
        q.eq("studentId", args.studentId).eq("date", args.date)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("classId"), args.classId),
          q.eq(q.field("subjectId"), args.subjectId)
        )
      )
      .first();

    if (existingAttendance) {
      // Update existing attendance
      await ctx.db.patch(existingAttendance._id, {
        status: args.status,
        remarks: args.remarks,
      });
      return existingAttendance._id;
    }

    // Create new attendance record
    return await ctx.db.insert("attendance", {
      studentId: args.studentId,
      classId: args.classId,
      subjectId: args.subjectId,
      date: args.date,
      status: args.status,
      markedBy: args.markedBy,
      remarks: args.remarks,
      createdAt: Date.now(),
    });
  },
});

export const getAttendanceByClass = query({
  args: {
    classId: v.id("classes"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    // Get student details for each attendance record
    const attendanceWithStudents = await Promise.all(
      attendance.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        const teacher = await ctx.db.get(record.markedBy);
        const subject = await ctx.db.get(record.subjectId);
        
        return {
          ...record,
          student: student ? {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
          } : null,
          teacher: teacher ? {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          } : null,
          subject: subject ? {
            _id: subject._id,
            name: subject.name,
            code: subject.code,
          } : null,
        };
      })
    );

    return attendanceWithStudents;
  },
});

export const getStudentAttendance = query({
  args: {
    studentId: v.id("students"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Get subject details for each attendance record
    const attendanceWithSubjects = await Promise.all(
      attendance.map(async (record) => {
        const subject = await ctx.db.get(record.subjectId);
        const teacher = await ctx.db.get(record.markedBy);
        
        return {
          ...record,
          subject: subject ? {
            _id: subject._id,
            name: subject.name,
            code: subject.code,
          } : null,
          teacher: teacher ? {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          } : null,
        };
      })
    );

    return attendanceWithSubjects;
  },
});

// Grade Management
export const addGrade = mutation({
  args: {
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
    remarks: v.optional(v.string()),
    gradedBy: v.id("teachers"),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const percentage = (args.score / args.maxScore) * 100;
    
    return await ctx.db.insert("grades", {
      studentId: args.studentId,
      subjectId: args.subjectId,
      classId: args.classId,
      assessmentType: args.assessmentType,
      title: args.title,
      score: args.score,
      maxScore: args.maxScore,
      percentage,
      remarks: args.remarks,
      gradedBy: args.gradedBy,
      gradedAt: Date.now(),
      academicYear: args.academicYear,
    });
  },
});

export const updateGrade = mutation({
  args: {
    gradeId: v.id("grades"),
    score: v.number(),
    maxScore: v.number(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const percentage = (args.score / args.maxScore) * 100;
    
    await ctx.db.patch(args.gradeId, {
      score: args.score,
      maxScore: args.maxScore,
      percentage,
      remarks: args.remarks,
    });
  },
});

export const getStudentGrades = query({
  args: {
    studentId: v.id("students"),
    subjectId: v.optional(v.id("subjects")),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    let gradesQuery = ctx.db
      .query("grades")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("academicYear"), args.academicYear));

    if (args.subjectId) {
      gradesQuery = gradesQuery.filter((q) => q.eq(q.field("subjectId"), args.subjectId));
    }

    const grades = await gradesQuery.collect();

    // Get subject and teacher details
    const gradesWithDetails = await Promise.all(
      grades.map(async (grade) => {
        const subject = await ctx.db.get(grade.subjectId);
        const teacher = await ctx.db.get(grade.gradedBy);
        
        return {
          ...grade,
          subject: subject ? {
            _id: subject._id,
            name: subject.name,
            code: subject.code,
          } : null,
          teacher: teacher ? {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          } : null,
        };
      })
    );

    return gradesWithDetails;
  },
});

export const getClassGrades = query({
  args: {
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    assessmentType: v.optional(v.union(
      v.literal("assignment"),
      v.literal("quiz"),
      v.literal("midterm"),
      v.literal("final"),
      v.literal("project")
    )),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    let gradesQuery = ctx.db
      .query("grades")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => 
        q.and(
          q.eq(q.field("subjectId"), args.subjectId),
          q.eq(q.field("academicYear"), args.academicYear)
        )
      );

    if (args.assessmentType) {
      gradesQuery = gradesQuery.filter((q) => q.eq(q.field("assessmentType"), args.assessmentType));
    }

    const grades = await gradesQuery.collect();

    // Get student details
    const gradesWithStudents = await Promise.all(
      grades.map(async (grade) => {
        const student = await ctx.db.get(grade.studentId);
        const teacher = await ctx.db.get(grade.gradedBy);
        
        return {
          ...grade,
          student: student ? {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
          } : null,
          teacher: teacher ? {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          } : null,
        };
      })
    );

    return gradesWithStudents;
  },
});

// Fee Management
export const addFee = mutation({
  args: {
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
    academicYear: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("fees", {
      studentId: args.studentId,
      feeType: args.feeType,
      amount: args.amount,
      dueDate: args.dueDate,
      paidAmount: 0,
      status: "pending",
      academicYear: args.academicYear,
      remarks: args.remarks,
      createdAt: Date.now(),
    });
  },
});

export const recordPayment = mutation({
  args: {
    feeId: v.id("fees"),
    paidAmount: v.number(),
    paymentMethod: v.optional(v.string()),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fee = await ctx.db.get(args.feeId);
    if (!fee) {
      throw new ConvexError("Fee record not found");
    }

    const newPaidAmount = fee.paidAmount + args.paidAmount;
    let status = fee.status;

    if (newPaidAmount >= fee.amount) {
      status = "paid";
    } else if (newPaidAmount > 0) {
      status = "partial";
    }

    await ctx.db.patch(args.feeId, {
      paidAmount: newPaidAmount,
      paidDate: Date.now(),
      status,
    });
  },
});

export const getStudentFees = query({
  args: {
    studentId: v.id("students"),
    academicYear: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("overdue")
    )),
  },
  handler: async (ctx, args) => {
    let feesQuery = ctx.db
      .query("fees")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("academicYear"), args.academicYear));

    if (args.status) {
      feesQuery = feesQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await feesQuery.collect();
  },
});

// Enrollment Management
export const enrollStudent = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if student is already enrolled in this class for this academic year
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => 
        q.and(
          q.eq(q.field("classId"), args.classId),
          q.eq(q.field("academicYear"), args.academicYear)
        )
      )
      .first();

    if (existingEnrollment) {
      throw new ConvexError("Student is already enrolled in this class");
    }

    // Check class capacity
    const classInfo = await ctx.db.get(args.classId);
    if (!classInfo) {
      throw new ConvexError("Class not found");
    }

    if (classInfo.currentEnrollment >= classInfo.capacity) {
      throw new ConvexError("Class is at full capacity");
    }

    // Create enrollment
    const enrollmentId = await ctx.db.insert("enrollments", {
      studentId: args.studentId,
      classId: args.classId,
      academicYear: args.academicYear,
      enrollmentDate: Date.now(),
      status: "active",
    });

    // Update class enrollment count
    await ctx.db.patch(args.classId, {
      currentEnrollment: classInfo.currentEnrollment + 1,
    });

    return enrollmentId;
  },
});

export const getClassEnrollments = query({
  args: {
    classId: v.id("classes"),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("academicYear"), args.academicYear))
      .collect();

    // Get student details for each enrollment
    const enrollmentsWithStudents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        
        return {
          ...enrollment,
          student: student ? {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
            grade: student.grade,
            section: student.section,
          } : null,
        };
      })
    );

    return enrollmentsWithStudents;
  },
});

// Class-Subject Assignment
export const assignSubjectToClass = mutation({
  args: {
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
        startTime: v.string(),
        endTime: v.string(),
        room: v.optional(v.string()),
      })
    ),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if subject is already assigned to this class
    const existingAssignment = await ctx.db
      .query("classSubjects")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => 
        q.and(
          q.eq(q.field("subjectId"), args.subjectId),
          q.eq(q.field("academicYear"), args.academicYear)
        )
      )
      .first();

    if (existingAssignment) {
      throw new ConvexError("Subject is already assigned to this class");
    }

    return await ctx.db.insert("classSubjects", {
      classId: args.classId,
      subjectId: args.subjectId,
      teacherId: args.teacherId,
      schedule: args.schedule,
      academicYear: args.academicYear,
      isActive: true,
    });
  },
});

export const getClassSchedule = query({
  args: {
    classId: v.id("classes"),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const classSubjects = await ctx.db
      .query("classSubjects")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => 
        q.and(
          q.eq(q.field("academicYear"), args.academicYear),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Get subject and teacher details
    const scheduleWithDetails = await Promise.all(
      classSubjects.map(async (classSubject) => {
        const subject = await ctx.db.get(classSubject.subjectId);
        const teacher = await ctx.db.get(classSubject.teacherId);
        
        return {
          ...classSubject,
          subject: subject ? {
            _id: subject._id,
            name: subject.name,
            code: subject.code,
          } : null,
          teacher: teacher ? {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          } : null,
        };
      })
    );

    return scheduleWithDetails;
  },
});

// Dashboard Statistics
export const getDashboardStats = query({
  args: {
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const students = await ctx.db
      .query("students")
      .withIndex("by_academic_year", (q) => q.eq("academicYear", args.academicYear))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_academic_year", (q) => q.eq("academicYear", args.academicYear))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const totalEnrollment = classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0);
    const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalEnrollment,
      totalCapacity,
      enrollmentRate: totalCapacity > 0 ? (totalEnrollment / totalCapacity) * 100 : 0,
    };
  },
});