import prisma from '../../app/shared/prisma';
import { cloudinaryUpload } from '../../app/config/cloudinary.config';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { IPaymentMethod, IPaymentMethodUpdate, IPaymentMethodFilters } from './paymentMethods.interface';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Given a Cloudinary public_id, return a secure optimised URL.
 * Falls back to the raw path string if no publicId is stored.
 */
const buildLogoUrl = (publicId: string): string =>
  cloudinaryUpload.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
  });

/**
 * Parse and attach the uploaded logo file to a data payload.
 * The logo field stores the Cloudinary public_id (filename).
 */
const extractLogoFromFile = (
  file: Express.Multer.File | undefined,
): string | undefined => {
  if (!file) return undefined;
  // multer-storage-cloudinary sets file.filename to the Cloudinary public_id
  return file.filename || file.path;
};

// ─── enriched response ────────────────────────────────────────────────────────

/**
 * Transform a raw DB record so callers receive a resolved `logoUrl`
 * alongside the stored `logo` public_id.
 */
const withLogoUrl = (pm: any) => {
  if (!pm) return pm;
  return {
    ...pm,
    logoUrl: pm.logo ? buildLogoUrl(pm.logo) : null,
  };
};

// ─── service functions ────────────────────────────────────────────────────────

const createPaymentMethodInDb = async (
  body: IPaymentMethod,
  file?: Express.Multer.File,
) => {
  const logo = extractLogoFromFile(file);

  // Coerce isActive to boolean — multipart form-data sends strings so guard
  // here in case the middleware transform didn't run (e.g. direct API calls).
  const isActive =
    typeof body.isActive === 'string'
      ? (body.isActive as string) === 'true'
      : (body.isActive ?? true);

  const result = await prisma.paymentMethod.create({
    data: {
      name: body.name,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
      accountType: body.accountType,
      instructions: body.instructions ?? null,
      logo: logo ?? null,
      isActive,
    },
  });

  return withLogoUrl(result);
};

const getAllPaymentMethodsFromDb = async (
  filters: IPaymentMethodFilters,
  query: Record<string, unknown>,
  onlyActive = false,
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  // Students can only see active methods
  if (onlyActive) {
    andConditions.push({ isActive: true });
  } else if (filters.isActive !== undefined) {
    andConditions.push({ isActive: filters.isActive });
  }

  if (filters.accountType) {
    andConditions.push({ accountType: filters.accountType });
  }

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { accountName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { accountType: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.paymentMethod.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.paymentMethod.count({ where }),
  ]);

  return {
    meta: { page, limit, total },
    data: data.map(withLogoUrl),
  };
};

const getSinglePaymentMethodFromDb = async (id: string) => {
  const result = await prisma.paymentMethod.findUniqueOrThrow({
    where: { id },
  });
  return withLogoUrl(result);
};

const updatePaymentMethodInDb = async (
  id: string,
  body: IPaymentMethodUpdate,
  file?: Express.Multer.File,
) => {
  // Ensure record exists
  const existing = await prisma.paymentMethod.findUniqueOrThrow({
    where: { id },
  });

  let logo: string | undefined = undefined;

  if (file) {
    // Delete the old logo from Cloudinary if one existed
    if (existing.logo) {
      await cloudinaryUpload.uploader.destroy(existing.logo).catch(() => {
        // Non-fatal — continue even if old logo removal fails
      });
    }
    logo = extractLogoFromFile(file);
  }

  const data: any = { ...body };
  if (logo !== undefined) data.logo = logo;

  // Coerce isActive string → boolean (guard for direct API calls that bypass
  // the Zod middleware transform).
  if (typeof data.isActive === 'string') {
    data.isActive = data.isActive === 'true';
  }

  // Remove undefined keys so Prisma doesn't overwrite with undefined
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  const result = await prisma.paymentMethod.update({
    where: { id },
    data,
  });

  return withLogoUrl(result);
};

const deletePaymentMethodInDb = async (id: string) => {
  const existing = await prisma.paymentMethod.findUniqueOrThrow({
    where: { id },
  });

  // Check no enrollments depend on this payment method
  const enrollmentCount = await prisma.enrollment.count({
    where: { paymentMethodId: id },
  });

  if (enrollmentCount > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot delete this payment method — ${enrollmentCount} enrollment(s) are linked to it.`,
    );
  }

  // Remove logo from Cloudinary
  if (existing.logo) {
    await cloudinaryUpload.uploader.destroy(existing.logo).catch(() => {});
  }

  return prisma.paymentMethod.delete({ where: { id } });
};

export const PaymentMethodService = {
  createPaymentMethodInDb,
  getAllPaymentMethodsFromDb,
  getSinglePaymentMethodFromDb,
  updatePaymentMethodInDb,
  deletePaymentMethodInDb,
};
