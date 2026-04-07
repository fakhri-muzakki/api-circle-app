import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';
import { compare, hash } from 'bcrypt';
import env from '../../config/env';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { AppError } from '../../shared/errors/AppError';
import type { User } from '../../generated/prisma/client';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email, fullName } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
      });
    }

    const hashPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword,
        fullName,
      },
      omit: {
        password: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'berhasil',
      data: user,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) throw new AppError('User is not found', 404);

    if (!user.password) {
      throw new AppError(
        'This account is registered with Google. Please login using Google.',
        400
      );
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new AppError('Password is wrong', 404);

    const accessTokenExpired = env.accessTokenExpired;

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      env.accessTokenSecret,
      { expiresIn: accessTokenExpired }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production', // maksudnya https ketika production
      sameSite: 'strict',
      maxAge: ms(accessTokenExpired), // 2 minute
    });

    return res.status(200).json({
      success: true,
      message: 'Login successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.log(error);
    next();
  }
};

export const callbackGooleAndGithub = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as User;
    const token = jwt.sign({ userId: user.id }, env.accessTokenSecret, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return res.redirect(
      `http://localhost:5173/oauth-success?token=${token}&user-id=${user.id}`
    );
  } catch (error) {
    next(error);
  }
};
