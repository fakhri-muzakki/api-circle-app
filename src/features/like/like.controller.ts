import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import type { Prisma } from '../../generated/prisma';

interface LikeBody {
  userId: string;
  threadId: string;
}

export const createLike = async (
  req: Request<object, object, LikeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { threadId } = req.body;

    if (!user) {
      throw new AppError('Token is invalid or not found', 400);
    }

    // cek apakah sudah ada
    const existingThread = await prisma.like.findFirst({
      where: { userId: user.id, threadId },
    });

    type Data =
      | Prisma.BatchPayload
      | {
          threadId: string;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          createdBy: string | null;
          userId: string;
        };

    let data: Data;
    if (existingThread) {
      data = await prisma.like.deleteMany({
        where: { userId: user.id, threadId },
      });
    } else {
      data = await prisma.like.create({
        data: { userId: user.id, threadId },
      });
    }

    return res.status(200).json({
      success: true,
      message: `${existingThread ? 'Unlike' : 'Like'} thread successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};
