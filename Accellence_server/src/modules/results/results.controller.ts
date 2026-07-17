import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import prisma from '../../app/shared/prisma';
import httpStatus from 'http-status';

const createResult = catchAsync(async (req, res) => {
  const { studentId, courseId, marks, grade, remarks } = req.body;

  const result = await prisma.result.create({
    data: {
      studentId: String(studentId),
      courseId: String(courseId),
      marks: Number(marks),
      grade: String(grade),
      remarks: remarks ? String(remarks) : null,
    },
    include: {
      course: true,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Result uploaded successfully',
    data: result,
  });
});

const getStudentResults = catchAsync(async (req, res) => {
  const studentId = req.query.studentId;

  if (typeof studentId !== 'string') {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'studentId is required',
      data: null,
    });
  }

  const results = await prisma.result.findMany({
    where: {
      studentId,
    },
    include: {
      course: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      examDate: 'desc',
    },
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