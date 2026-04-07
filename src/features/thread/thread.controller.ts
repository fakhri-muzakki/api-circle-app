import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';
import { uploadImageToSupabase } from '../../shared/utils/uploadImage';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AppError } from '../../shared/errors/AppError';

dayjs.extend(relativeTime);

function formatTime(date: Date) {
  return dayjs(date).fromNow(); // contoh: "4 hours ago"
}

export const getTheads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError('Token tidak valid', 404);
    }

    const threads = await prisma.thread.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
            photoProfile: true,
          },
        },

        // count tetap pakai ini
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },

        // 🔥 ini kuncinya
        likes: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = threads.map((thread) => ({
      id: thread.id,
      name: thread.user.fullName,
      image: thread.image,
      username: thread.user.username,
      avatar: thread.user.photoProfile,
      time: formatTime(thread.createdAt),
      content: thread.content,
      likes: thread._count.likes,
      comments: thread._count.replies,

      // 🔥 ini hasilnya
      isLiked: thread.likes.length > 0,
    }));

    return res.status(200).json({
      success: true,
      message: 'Fetched threads successfully ',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

interface CreateThreadBody {
  content: string;
}

export const createThread = async (
  req: Request<object, object, CreateThreadBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { content } = req.body;

    if (!user) {
      throw new AppError('Token invalid', 404);
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const imageUrl = await uploadImageToSupabase(file); // return-nya string url gambarnya

    const data = await prisma.thread.create({
      data: { content, image: imageUrl, userId: user.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Created thread successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
