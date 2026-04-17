import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';

export const createFollow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followerId, followingId } = req.body;
    const data = await prisma.following.create({
      data: {
        followerId,
        followingId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Created follow successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFollow = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error('Token invalid');
    }

    const data = await prisma.following.deleteMany({
      where: { followingId: id, followerId: user.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Deleted follow successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
