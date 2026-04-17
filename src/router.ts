import { Router } from 'express';
import userRoutes from './features/user/user.route';
import authRoutes from './features/auth/auth.route';
import threadRoutes from './features/thread/thread.route';
import likeRoutes from './features/like/like.route';
import replyRoutes from './features/reply/reply.route';
import followRoutes from './features/follow/follow.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/threads', threadRoutes);
router.use('/likes', likeRoutes);
router.use('/replies', replyRoutes);
router.use('/follows', followRoutes);

export default router;
