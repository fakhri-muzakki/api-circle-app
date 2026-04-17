import { type NextFunction, type Request, type Response } from 'express';
import prisma from '../../config/prisma';
import { formatTime } from '../../shared/utils/formatTime';
import {
  getFollowersService,
  getFollowingService,
  searchUsersService,
} from './user.service';
import { AppError } from '../../shared/errors/AppError';
import { uploadToCloudinary } from '../../shared/utils/cloudinaryUpload';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) throw new AppError('Token is not found', 404);

    const { cursor, limit = 10 } = req.query;
    const take = Math.min(Number(limit), 50); // cap max limit, supaya client gak bisa minta bebas

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        NOT: {
          following: {
            some: { followerId: user.id },
          },
        },
      },
      take: take + 1, // ambil 1 lebih untuk deteksi hasNextPage
      ...(cursor && {
        skip: 1, // skip cursor itu sendiri
        cursor: { id: String(cursor) },
      }),
      select: {
        id: true,
        username: true,
        fullName: true,
        photoProfile: true,
        bio: true,
        following: {
          where: { followerId: user.id },
          select: { id: true },
        },
      },
      orderBy: { id: 'asc' }, // WAJIB ada orderBy saat pakai cursor
    });

    const hasNextPage = users.length > take;
    const data = hasNextPage ? users.slice(0, -1) : users; // buang item ke-N+1

    const result = data.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.fullName,
      avatar: user.photoProfile,
      bio: user.bio,
      isFollowing: user.following.length > 0,
    }));

    return res.status(200).json({
      success: true,
      message: 'Get users successfully',
      data: result,
      nextCursor: hasNextPage ? result[result.length - 1].id : null,
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
    const data = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        photoProfile: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    const result = {
      id: data?.id,
      username: data?.username,
      name: data?.fullName, // 🔥 alias di sini
      email: data?.email,
      avatar: data?.photoProfile,
      bio: data?.bio,
      followers: data?._count.followers,
      following: data?._count.following,
    };

    return res.status(200).json({
      success: true,
      message: 'Fetched user successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfileById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = req.params;
    const data = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            following: true,
            followers: true,
          },
        },
      },
    });

    const result = {
      id: data?.id,
      avatar: data?.photoProfile,
      name: data?.fullName,
      username: data?.username,
      following: data?._count.following,
      follower: data?._count.followers,
      bio: data?.bio,
    };

    return res.status(200).json({
      success: true,
      message: 'Fetched user successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getThreadsByUserId = async (
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { username } = req.params;

    if (!user) {
      throw new Error('User not found');
    }

    const data = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            following: true,
            followers: true,
          },
        },
        following: {
          where: {
            followerId: user.id,
          },
        },
        threads: {
          include: {
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
        },
      },
    });

    let result;
    if (data) {
      const { threads } = data;
      result = threads.map((thread) => ({
        id: thread.id,

        name: data.fullName,
        username: data.username,
        avatar: data.photoProfile,

        time: formatTime(thread.createdAt),
        image: thread.image,
        content: thread.content,
        likes: thread._count.likes,
        comments: thread._count.replies,
        isLiked: thread.likes.length > 0,
      }));
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched threads successfully',
      data: data && {
        id: data?.id,
        name: data?.fullName,
        username: data?.username,
        avatar: data?.photoProfile,
        bio: data?.bio,
        following: data?._count.followers,
        followers: data?._count.following,
        isFollowing: data?.following
          ? (data?.following.length ?? 0) > 0
          : undefined,
        threads: result,
      },
      // data,
    });
  } catch (error) {
    next(error);
  }
};

// user.controller.ts
// user.controller.ts
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const user = req.user;

    if (!user) {
      throw new AppError('Token invalid', 400);
    }

    if (typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "q" is required',
      });
    }

    const users = await searchUsersService(q, user.id);

    return res.json({
      success: true,
      message: 'search user successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFollowers = async (
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = req.user;
    if (!user) {
      throw new AppError('Token invalid', 400);
    }

    // Dapat data users yang diikuti nawir
    const data = await getFollowersService(username, user.id);

    return res.status(200).json({
      success: true,
      message: 'Fetched user following successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFollowing = async (
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = req.user;
    if (!user) {
      throw new AppError('Token invalid', 400);
    }

    // Dapat data users yang diikuti nawir
    const data = await getFollowingService(username, user.id);

    return res.status(200).json({
      success: true,
      message: 'Fetched user following successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

interface UpdateUserProfileBody {
  name: string;
  username: string;
  bio: string;
}

export const updateUserProfile = async (
  req: Request<{ id: string }, object, UpdateUserProfileBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, username, bio } = req.body;
    const file = req.file;

    let imageUrl: string | undefined;
    if (file) {
      const result = await uploadToCloudinary(file.buffer, 'avatars');
      imageUrl = result.url;
    }

    const data = await prisma.user.update({
      where: { id },
      data: { fullName: name, username, bio, photoProfile: imageUrl },
      omit: {
        password: true,
        createdBy: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Updated user profile successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
