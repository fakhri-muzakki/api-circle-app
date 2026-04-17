import prisma from '../../config/prisma';

const createFollow = async (followerId: string, followingId: string) => {
  const data = await prisma.following.create({
    data: {
      followerId,
      followingId,
    },
  });

  return data;
};

export default createFollow;
