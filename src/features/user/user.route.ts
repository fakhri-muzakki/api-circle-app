import { Router } from 'express';
import {
  getThreadsByUserId,
  getUserById,
  getUserFollowers,
  getUserFollowing,
  getUserProfileById,
  getUsers,
  searchUsers,
  updateUserProfile,
} from './user.controller';
import { verifyToken } from '../../shared/middlewares/auth';
import { uploadToBuffer } from '../../config/multer';

const router = Router();
router.get('/', verifyToken, getUsers);
router.get('/search', verifyToken, searchUsers);
router.get('/:id', getUserById);

router.put(
  '/:id',
  verifyToken,
  uploadToBuffer.single('image'),
  updateUserProfile
);
router.get('/:username/threads', verifyToken, getThreadsByUserId);

router.get('/:username/followers', verifyToken, getUserFollowers);
router.get('/:username/following', verifyToken, getUserFollowing); // ganti controllernya
// router.get('/:id/threads/media', getUserProfileById);

export default router;
