import express from 'express';
import { NoticeController } from './notices.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { NoticeValidation } from './notices.validation';
import auth from '../../app/middleWares/auth';
import { Role } from '../../generated/prisma';

const router = express.Router();

router.get('/', NoticeController.getAllNotices);
router.get('/:id', NoticeController.getSingleNotice);
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(NoticeValidation.createNoticeSchema),
  NoticeController.createNotice
);
router.put(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(NoticeValidation.updateNoticeSchema),
  NoticeController.updateNotice
);
router.delete('/:id', auth(Role.ADMIN), NoticeController.deleteNotice);

export const NoticeRoutes = router;


