import { Router } from 'express';
import userRoutes from './features/user/user.route';
import authRoutes from './features/auth/auth.route';
import threadRoutes from './features/thread/thread.route';
import likeRoutes from './features/like/like.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/threads', threadRoutes);
router.use('/likes', likeRoutes);

export default router;
