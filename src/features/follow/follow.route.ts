import { Router } from 'express';
import { createFollow, deleteFollow } from './follow.controller';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();

router.post('/', createFollow);
router.delete('/:id', verifyToken, deleteFollow);

export default router;
