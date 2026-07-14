import express from 'express';
import { UserContolors } from './users.controller';
import auth from '../../app/middleWares/auth';
import { Role } from '../../generated/prisma';

const router = express.Router();

// ADMIN: list all users (supports ?role=STUDENT|TEACHER|ADMIN)
router.get('/', auth(Role.ADMIN), UserContolors.getAllUsers);

// Any authenticated user can view a profile
router.get('/:id', auth(Role.ADMIN, Role.STUDENT, Role.TEACHER), UserContolors.getSingleUsers);

// User can update own profile; ADMIN can update any
router.put('/:id', auth(Role.ADMIN, Role.STUDENT, Role.TEACHER), UserContolors.updateSingleUsers);

// ADMIN only can delete
router.delete('/:id', auth(Role.ADMIN), UserContolors.deletedSingleUsers);

export const UsersRoutes = router;
