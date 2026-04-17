import { Router } from 'express';
import { createReply } from './reply.controller';
import { upload, uploadToBuffer } from '../../config/multer';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();
// router.get('/', verifyToken, getTheads);
router.post('/', verifyToken, uploadToBuffer.single('image'), createReply);
// router.post('/', verifyToken, upload.single('image'), createThread);

// router.get('/:id', verifyToken, getThreadWithRepliesByid);
// router.post('/', verifyToken, upload.single('image'), createThread);

export default router;
