import { Router } from 'express';
import { getUserById, getUsers } from './user.controller';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();
router.get('/', verifyToken, getUsers);
router.get('/:id', getUserById);

export default router;
