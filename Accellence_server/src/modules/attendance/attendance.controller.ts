import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import prisma from '../../app/shared/prisma';
import httpStatus from 'http-status';

const createAttendance = catchAsync(async (req, res) => {
  const { studentId, courseId, date, status } = req.body;
  const attendance = await prisma.attendance.create({
    data: {
      studentId,
      courseId,
      date: new Date(date),
      status,
    },
    include: {
      course: true,
    }
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Attendance logged successfully',
    data: attendance,
  });
});

const getStudentAttendance = catchAsync(async (req, res) => {
const studentId = req.query.studentId as string;
  const attendanceLogs = await prisma.attendance.findMany({
    where: { studentId },
    include: {
      course: true,
      student: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { date: 'desc' },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Attendance retrieved successfully',
    data: attendanceLogs,
  });
});

export const AttendanceController = {
  createAttendance,
  getStudentAttendance,
};
