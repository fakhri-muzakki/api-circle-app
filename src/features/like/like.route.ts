import { Router } from 'express';
import { createLike } from './like.controller';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();
router.post('/', verifyToken, createLike);

export default router;
