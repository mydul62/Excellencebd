import { User } from '@prisma/client';
import prisma from '../../app/shared/prisma';

const getAllUsersInToDb = async (query: Record<string, unknown>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (query?.searchTerm && typeof query.searchTerm === 'string' && query.searchTerm.trim()) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: 'insensitive' } },
        { email: { contains: query.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (query?.role) {
    andConditions.push({ role: query.role });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: result };
};

const getSingleUsersInToDb = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, slug: true } } },
      },
      reviews: true,
      teacherProfile: {
        select: { id: true, subject: true, bio: true, experienceYears: true, qualification: true },
      },
    },
  });
  return result;
};

const updateUserInToDb = async (id: string, payload: Partial<User>) => {
  const { password, role, ...safePayload } = payload as any;

  const result = await prisma.user.update({
    where: { id },
    data: safePayload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const deleteUserInToDb = async (id: string) => {
  const result = await prisma.user.delete({ where: { id } });
  return result;
};

export const userServices = {
  getAllUsersInToDb,
  getSingleUsersInToDb,
  updateUserInToDb,
  deleteUserInToDb,
};
