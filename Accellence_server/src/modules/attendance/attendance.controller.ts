import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import prisma from '../../app/shared/prisma';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from "@prisma/client";

const getAllAttendance = catchAsync(async (req, res) => {
  const currentUser = req.user as JwtPayload;
  
  let whereClause: any = {};
  
  // If TEACHER, only show attendance for their courses
  if (currentUser.role === Role.TEACHER) {
    // Find teacher profile
    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
      select: { id: true }
    });
    
    if (!teacher) {
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'No attendance records found',
        data: [],
      });
    }
    
    // Get courses taught by this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true }
    });
    
    const courseIds = courses.map(c => c.id);
    whereClause = { courseId: { in: courseIds } };
  }
  
  const attendanceLogs = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      course: {
        select: { id: true, title: true, slug: true }
      },
      student: {
        select: { 
          id: true, 
          name: true, 
          email: true,
          avatar: true 
        }
      }
    },
    orderBy: { date: 'desc' },
    take: 100, // Limit results
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Attendance retrieved successfully',
    data: attendanceLogs,
  });
});

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
  getAllAttendance,
  createAttendance,
  getStudentAttendance,
};
