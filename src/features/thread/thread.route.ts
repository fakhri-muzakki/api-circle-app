import { Router } from 'express';
import {
  createThread,
  getTheads,
  getThreadWithRepliesByid,
} from './thread.controller';
import { upload } from '../../config/multer';
import { verifyToken } from '../../shared/middlewares/auth';

const router = Router();
router.get('/', verifyToken, getTheads);
router.post('/', verifyToken, upload.single('image'), createThread);

router.get('/:id', verifyToken, getThreadWithRepliesByid);

export default router;
