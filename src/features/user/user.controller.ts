import { type NextFunction, type Request, type Response } from 'express';
import prisma from '../../config/prisma';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.user.findMany();

    return res.status(200).json({
      success: true,
      message: 'Fetched users successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = req.params;
    const data = await prisma.user.findUnique({ where: { id: params.id } });

    return res.status(200).json({
      success: true,
      message: 'Fetched user successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
