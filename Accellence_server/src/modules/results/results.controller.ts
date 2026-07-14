import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import prisma from '../../app/shared/prisma';
import httpStatus from 'http-status';

const createResult = catchAsync(async (req, res) => {
  const { studentId, courseId, marks, grade, remarks } = req.body;
  const result = await prisma.result.create({
    data: {
      studentId,
      courseId,
      marks: Number(marks),
      grade,
      remarks,
    },
    include: {
      course: true,
    }
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Result uploaded successfully',
    data: result,
  });
});

const getStudentResults = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const results = await prisma.result.findMany({
    where: { studentId },
    include: {
      course: true,
      student: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { examDate: 'desc' },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Results retrieved successfully',
    data: results,
  });
});

export const ResultController = {
  createResult,
  getStudentResults,
};
