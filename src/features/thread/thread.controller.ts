import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';
import { uuidv7 } from 'uuidv7';

import { AppError } from '../../shared/errors/AppError';
import { getIO } from '../../config/socket';
import { threadQueue } from '../../queue/gallery';
import { formatTime } from '../../shared/utils/formatTime';

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
      orderBy: {
        createdAt: 'desc',
      },
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

        likes: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
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

    const data = await prisma.thread.create({
      data: {
        id: uuidv7(),
        content,
        image: null,
        userId: user.id,
      },
    });

    const file = req.file;
    if (file) {
      await threadQueue.add('upload-image', {
        galleryId: data.id,
        filePath: file.path,
      });
    } else {
      const io = getIO();
      io.emit('thread:created', data); // kirim event ke semua client
    }

    return res.status(200).json({
      success: true,
      message: 'Created thread successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getThreadWithRepliesByid = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError('Token invalid token', 400);
    }

    const data = await prisma.thread.findUnique({
      where: { id: id },
      include: {
        user: true,
        replies: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },

        likes: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!data) {
      throw new AppError('Thread is not found', 404);
    }

    const { _count, likes, replies, ...others } = data;

    const mappedReplies = replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      image: reply.image,
      username: reply.user.username,
      name: reply.user.fullName,
      avatar: reply.user.photoProfile,
    }));

    const result = {
      ...others,
      isLiked: likes.length > 0,
      likes: _count.likes,
      comments: _count.replies,
      time: formatTime(data.createdAt),
      avatar: data.user.photoProfile,
      name: data.user.fullName,
      username: data.user.username,
      replies: mappedReplies,
    };

    return res.status(200).json({
      success: true,
      message: 'Fetched thread with replies successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
