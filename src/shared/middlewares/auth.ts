import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../config/env';
import type { JwtPayload } from '../types/express';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const token = req.cookies.accessToken;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const accessTokenSecret = env.accessTokenSecret;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret!);
    req.user = decoded as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// type Role = 'ADMIN' | 'USER';
// export const verifyRole = (role: Role) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const userRole = req.user?.role;
//     if (userRole !== role) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied',
//       });
//     }
//     next();
//   };
// };
