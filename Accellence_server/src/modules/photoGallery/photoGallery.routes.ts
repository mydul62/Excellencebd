import express from 'express';
import { PhotoGalleryController } from './photoGallery.controller';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";
import { validateRequest } from '../../app/middleWares/validationRequest';
import { PhotoGalleryValidation } from './photoGallery.validation';
import { multerUpload } from '../../app/config/multer-config';

const router = express.Router();

router.get('/', PhotoGalleryController.getAllPhotos);
router.get('/:id', PhotoGalleryController.getSinglePhoto);
router.post(
  '/',
  auth(Role.ADMIN,Role.STUDENT),
  multerUpload.array('images', 10),
  validateRequest(PhotoGalleryValidation.createPhotoSchema),
  PhotoGalleryController.createPhoto
);
router.put(
  '/:id',
  auth(Role.ADMIN),
  multerUpload.single('image'),
  validateRequest(PhotoGalleryValidation.updatePhotoSchema),
  PhotoGalleryController.updatePhoto
);
router.delete('/:id', auth(Role.ADMIN), PhotoGalleryController.deletePhoto);

export const PhotoGalleryRoutes = router;
