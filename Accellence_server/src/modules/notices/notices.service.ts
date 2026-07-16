import prisma from '../../app/shared/prisma';
import { INotice, INoticeFilters } from './notices.interface';
import { noticeSearchableFields } from './notices.constant';

const createNoticeInDb = async (payload: INotice) => {
  const result = await prisma.notice.create({ data: payload });
  return result;
};

const getAllNoticesFromDb = async (
  filters: INoticeFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: noticeSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (filters.category) andConditions.push({ category: filters.category });
  if (filters.audience) andConditions.push({ audience: filters.audience });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.notice.count({ where }),
  ]);

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getSingleNoticeFromDb = async (id: string) => {
  const result = await prisma.notice.findUniqueOrThrow({ where: { id } });
  return result;
};

const updateNoticeInDb = async (id: string, payload: Partial<INotice>) => {
  const result = await prisma.notice.update({ where: { id }, data: payload });
  return result;
};

const deleteNoticeFromDb = async (id: string) => {
  const result = await prisma.notice.delete({ where: { id } });
  return result;
};

export const NoticeService = {
  createNoticeInDb,
  getAllNoticesFromDb,
  getSingleNoticeFromDb,
  updateNoticeInDb,
  deleteNoticeFromDb,
};


