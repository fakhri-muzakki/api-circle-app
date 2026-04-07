import { Router } from 'express';
import { createThread, getTheads } from './thread.controller';
import { upload } from '../../config/multer';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();
router.get('/', verifyToken, getTheads);
router.post('/', verifyToken, upload.single('image'), createThread);
// router.post('/', verifyToken, upload.single('image'), createThread);

export default router;
