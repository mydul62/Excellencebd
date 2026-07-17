import prisma from "../../app/shared/prisma";
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { Role } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { ICreateStudent, IUpdateStudent, IStudentFilters } from './students.interface';

const createStudentInDb = async (payload: ICreateStudent) => {
  const {
    name,
    email,
    password,
    avatar,
    phone,
    guardian,
    address,
    status,
    gender,
    dateOfBirth,
    bloodGroup,
    emergencyContact,
    department,
    subject,
  } = payload;

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password || 'Student@123456', 10);

  const result = await prisma.$transaction(async (tx:any) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        avatar: avatar ?? null,
        phone: phone ?? null,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        guardian: guardian ?? null,
        address: address ?? null,
        status: status ?? 'active',
      },
    });

    await tx.profile.create({
      data: {
        userId: user.id,
        address: address ?? null,
        gender: gender ?? null,
        dateOfBirth: dateOfBirth ?? null,
        department: department ?? 'General',
        subject: subject ?? 'All',
        bloodGroup: bloodGroup ?? null,
        emergencyContact: emergencyContact ?? null,
      },
    });

    return {
      ...student,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  });

  return result;
};

const getAllStudentsFromDb = async (
  filters: IStudentFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 100;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { guardian: { contains: filters.searchTerm, mode: 'insensitive' } },
        { address: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.email) {
    andConditions.push({ user: { email: filters.email } });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  // Map to format aligned with frontend expectations if needed
  const mappedData = result.map((item:any) => {
    return {
      id: item.userId, // frontend uses User ID for student management
      studentProfileId: item.id,
      name: item.user.name,
      email: item.user.email,
      avatar: item.user.avatar,
      phone: item.user.phone,
      role: 'STUDENT',
      createdAt: item.user.createdAt,
      updatedAt: item.user.updatedAt,
      guardian: item.guardian,
      address: item.address,
      status: item.status,
      profile: item.user.profile,
    };
  });

  return { meta: { page, limit, total }, data: mappedData };
};

const getSingleStudentFromDb = async (id: string) => {
  // id could be Student ID or User ID. Let's find by either.
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { id },
        { userId: id },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  return {
    id: student.userId,
    studentProfileId: student.id,
    name: student.user.name,
    email: student.user.email,
    avatar: student.user.avatar,
    phone: student.user.phone,
    role: 'STUDENT',
    createdAt: student.user.createdAt,
    updatedAt: student.user.updatedAt,
    guardian: student.guardian,
    address: student.address,
    status: student.status,
    profile: student.user.profile,
  };
};

const updateStudentInDb = async (id: string, payload: IUpdateStudent) => {
  // Find the student by either student ID or user ID
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { id },
        { userId: id },
      ],
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const {
    name,
    avatar,
    phone,
    guardian,
    address,
    status,
    gender,
    dateOfBirth,
    bloodGroup,
    emergencyContact,
    department,
    subject,
  } = payload;

  const result = await prisma.$transaction(async (tx:any) => {
    // 1. Update User fields
    if (name !== undefined || avatar !== undefined || phone !== undefined) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // 2. Update Student fields
    if (guardian !== undefined || address !== undefined || status !== undefined) {
      await tx.student.update({
        where: { id: student.id },
        data: {
          ...(guardian !== undefined && { guardian }),
          ...(address !== undefined && { address }),
          ...(status !== undefined && { status }),
        },
      });
    }

    // 3. Update Profile fields
    const existingProfile = await tx.profile.findUnique({
      where: { userId: student.userId },
    });

    const profileData = {
      ...(address !== undefined && { address }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(department !== undefined && { department }),
      ...(subject !== undefined && { subject }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(emergencyContact !== undefined && { emergencyContact }),
    };

    if (existingProfile) {
      await tx.profile.update({
        where: { userId: student.userId },
        data: profileData,
      });
    } else {
      await tx.profile.create({
        data: {
          userId: student.userId,
          ...profileData,
        },
      });
    }

    // Return the fresh data
    const updatedUser = await tx.user.findUniqueOrThrow({
      where: { id: student.userId },
      include: { profile: true },
    });

    const updatedStudent = await tx.student.findUniqueOrThrow({
      where: { id: student.id },
    });

    return {
      id: updatedStudent.userId,
      studentProfileId: updatedStudent.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      role: 'STUDENT',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      guardian: updatedStudent.guardian,
      address: updatedStudent.address,
      status: updatedStudent.status,
      profile: updatedUser.profile,
    };
  });

  return result;
};

const deleteStudentFromDb = async (id: string) => {
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { id },
        { userId: id },
      ],
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  // Delete User, which cascades to Student and Profile tables
  const result = await prisma.user.delete({
    where: { id: student.userId },
  });

  return result;
};

export const StudentService = {
  createStudentInDb,
  getAllStudentsFromDb,
  getSingleStudentFromDb,
  updateStudentInDb,
  deleteStudentFromDb,
};
