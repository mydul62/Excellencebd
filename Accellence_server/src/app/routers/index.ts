import express from 'express';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import { UsersRoutes } from '../../modules/users/users.routes';
import { AdminRoutes } from '../../modules/admin/admin.routes';
import { MailRoutes } from '../../modules/contact/contact.route';
import { CourseRoutes } from '../../modules/courses/courses.routes';
import { TeacherRoutes } from '../../modules/teachers/teachers.routes';
import { StudentRoutes } from '../../modules/students/students.routes';
import { ResultRoutes } from '../../modules/results/results.routes';
import { AttendanceRoutes } from '../../modules/attendance/attendance.routes';
import { EnrollmentRoutes } from '../../modules/enrollments/enrollments.routes';
import { NoticeRoutes } from '../../modules/notices/notices.routes';
import { ReviewRoutes } from '../../modules/reviews/reviews.routes';
import { PhotoGalleryRoutes } from '../../modules/photoGallery/photoGallery.routes';
import { PaymentMethodRoutes } from '../../modules/paymentMethods/paymentMethods.routes';
import { CourseReviewRoutes } from '../../modules/courseReview/courseReview.routes';
import { CourseMaterialRoutes } from '../../modules/courseMaterial/courseMaterial.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UsersRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/sendMail', route: MailRoutes },
  { path: '/courses', route: CourseRoutes },
  { path: '/teachers', route: TeacherRoutes },
  { path: '/students', route: StudentRoutes },
  { path: '/results', route: ResultRoutes },
  { path: '/attendance', route: AttendanceRoutes },
  { path: '/enrollments', route: EnrollmentRoutes },
  { path: '/notices', route: NoticeRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/photo-gallery', route: PhotoGalleryRoutes },
  { path: '/payment-methods', route: PaymentMethodRoutes },
  { path: '/course-review',   route: CourseReviewRoutes },
  { path: '/course-material', route: CourseMaterialRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
