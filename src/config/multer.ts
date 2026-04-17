import multer from 'multer';
import path from 'path';

export const uploadToBuffer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'src/public/uploads'));
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, '-');
    const uniqueName = `${Date.now()}-${fileName}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
