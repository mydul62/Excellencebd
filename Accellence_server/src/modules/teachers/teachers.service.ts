import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { Role } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { ICreateTeacher, IUpdateTeacher, ITeacherFilters } from './teachers.interface';
import { teacherSearchableFields } from './teachers.constant';

// ─── Admin creates Teacher: makes User + Teacher profile in a transaction ──────
const createTeacherInDb = async (payload: ICreateTeacher) => {
  const { name, email, password, avatar, phone, subject, bio, experienceYears, qualification, joinedAt } = payload;

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Transaction: create User + Teacher profile atomically
  const result = await prisma.$transaction(async (tx:any) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
        avatar: avatar ?? null,
        phone: phone ?? null,
      },
    });

    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        subject,
        bio: bio ?? null,
        experienceYears: experienceYears ?? 0,
        qualification: qualification ?? null,
        joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
        },
      },
    });

    return teacher;
  });

  return result;
};

const getAllTeachersFromDb = async (
  filters: ITeacherFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: teacherSearchableFields.map((field) => {
        // fields on Teacher model
        if (['subject', 'bio', 'qualification'].includes(field)) {
          return { [field]: { contains: filters.searchTerm, mode: 'insensitive' } };
        }
        // fields on related User model
        return { user: { [field]: { contains: filters.searchTerm, mode: 'insensitive' } } };
      }),
    });
  }

  if (filters.subject) {
    andConditions.push({ subject: { contains: filters.subject, mode: 'insensitive' } });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, phone: true },
        },
        courses: { select: { id: true, title: true, slug: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.teacher.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: result };
};

const getSingleTeacherFromDb = async (id: string) => {
  const result = await prisma.teacher.findUniqueOrThrow({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true, phone: true },
      },
      courses: true,
    },
  });
  return result;
};

const getTeacherByUserIdFromDb = async (userId: string) => {
  const result = await prisma.teacher.findFirst({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true, phone: true },
      },
      courses: true,
    },
  });
  return result;
};

// ─── Get courses assigned to a specific teacher ───────────────────────────────
const getTeacherCoursesFromDb = async (teacherId: string) => {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      teacher: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, phone: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return courses;
};

// ─── Get students enrolled in teacher's courses ───────────────────────────────
const getTeacherStudentsFromDb = async (teacherId: string) => {
  // First get all courses taught by this teacher
  const courses = await prisma.course.findMany({
    where: { teacherId },
    select: { id: true },
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return [];
  }

  // Get all enrollments for these courses
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: { in: courseIds },
      status: 'approved', // Only approved enrollments
    },
    include: {
      user: {
        select: { 
          id: true, 
          name: true, 
          email: true, 
          avatar: true, 
          phone: true,
          role: true,
          studentProfile: {
            select: {
              id: true,
              guardian: true,
              address: true,
              status: true,
            }
          }
        },
      },
      course: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  // Get unique students with their enrollment details
  const studentMap = new Map();
  enrollments.forEach((enrollment) => {
    const userId = enrollment.user.id;
    if (!studentMap.has(userId)) {
      studentMap.set(userId, {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        avatar: enrollment.user.avatar,
        phone: enrollment.user.phone,
        role: enrollment.user.role,
        studentProfile: enrollment.user.studentProfile,
        enrollments: [],
      });
    }
    studentMap.get(userId).enrollments.push({
      id: enrollment.id,
      course: enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    });
  });

  return Array.from(studentMap.values());
};

// ─── Update: touches both User and Teacher profile ────────────────────────────
const updateTeacherInDb = async (id: string, payload: IUpdateTeacher) => {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher not found');
  }

  const { name, avatar, phone, ...teacherFields } = payload;

  const result = await prisma.$transaction(async (tx:any) => {
    // update User fields if any were provided
    if (name !== undefined || avatar !== undefined || phone !== undefined) {
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // update Teacher profile fields
    const updated = await tx.teacher.update({
      where: { id },
      data: teacherFields,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, phone: true },
        },
      },
    });

    return updated;
  });

  return result;
};

const deleteTeacherFromDb = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher not found');
  }
  // Cascade deletes Teacher profile; User account also deleted via onDelete:Cascade
  const result = await prisma.user.delete({ where: { id: teacher.userId } });
  return result;
};

export const TeacherService = {
  createTeacherInDb,
  getAllTeachersFromDb,
  getSingleTeacherFromDb,
  getTeacherByUserIdFromDb,
  getTeacherCoursesFromDb,
  getTeacherStudentsFromDb,
  updateTeacherInDb,
  deleteTeacherFromDb,
};
