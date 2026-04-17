// user.service.ts

import prisma from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';

interface SearchUserResult {
  id: string;
  username: string;
  fullName: string;
  photoProfile: string | null;
  bio: string | null;
  isFollowing: boolean;
}

export const searchUsersService = async (
  query: string,
  currentUserId: string
): Promise<SearchUserResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.$queryRaw<SearchUserResult[]>`
    SELECT
      u.id,
      u.username,
      u.full_name       AS "name",
      u."photoProfile" AS "avatar",
      u.bio,
      CASE
        WHEN f.id IS NOT NULL THEN true
        ELSE false
      END AS "isFollowing"
    FROM users u
    LEFT JOIN "Following" f
      ON  f.following_id = u.id
      AND f.follower_id  = ${currentUserId}
    WHERE
      u.username  ILIKE ${'%' + trimmed + '%'}
      OR u.full_name ILIKE ${'%' + trimmed + '%'}
    ORDER BY
      similarity(u.username,  ${trimmed}) +
      similarity(u.full_name, ${trimmed}) DESC
    LIMIT 20
  `;
};

// following.service.ts

export const getFollowersService = async (
  targetUsername: string,
  currentUserId: string
) => {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  });

  if (!targetUser) throw new AppError('User not found', 404);

  const followers = await prisma.following.findMany({
    where: {
      followingId: targetUser.id,
    },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          fullName: true,
          photoProfile: true,
          bio: true,
          // ✅ Ganti "followers" menjadi "following"
          // Cek apakah fakhri ADA DI daftar following mereka
          // = apakah fakhri follow mereka
          following: {
            where: {
              followerId: currentUserId, // follower_id = fakhri
            },
            select: { id: true },
          },
        },
      },
    },
  });

  return followers.map(({ follower }) => ({
    id: follower.id,
    username: follower.username,
    name: follower.fullName,
    avatar: follower.photoProfile,
    bio: follower.bio,
    isFollowing: follower.following.length > 0, // ✅ ganti followers → following
  }));
};

export const getFollowingService = async (
  targetUsername: string,
  currentUserId: string
) => {
  // nawir
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  });

  if (!targetUser) {
    throw new AppError('User not found', 404);
  }

  const followers = await prisma.following.findMany({
    where: {
      // Yang ngikutin
      followerId: targetUser.id,
    },
    select: {
      // Yang di ikutin
      following: {
        select: {
          id: true,
          username: true,
          fullName: true,
          photoProfile: true,
          bio: true,
          following: {
            where: { followerId: currentUserId },
            select: { id: true },
          },
        },
      },
    },
  });

  return followers.map(({ following }) => ({
    id: following.id,
    username: following.username,
    name: following.fullName,
    avatar: following.photoProfile,
    bio: following.bio,
    isFollowing: following.following.length > 0,
  }));
};
