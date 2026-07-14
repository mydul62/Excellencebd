import express from 'express';
import { ReviewController } from './reviews.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { ReviewValidation } from './reviews.validation';
import auth from '../../app/middleWares/auth';
import { Role } from '../../generated/prisma';

const router = express.Router();

router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getSingleReview);
router.post(
  '/',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);
router.put(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(ReviewValidation.updateReviewSchema),
  ReviewController.updateReview
);
router.delete('/:id', auth(Role.ADMIN), ReviewController.deleteReview);

export const ReviewRoutes = router;


