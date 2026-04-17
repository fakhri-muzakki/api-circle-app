import { uuidv7 } from 'uuidv7';
import prisma from '../../config/prisma';

const createThread = async (userId: string) => {
  const result = await prisma.thread.create({
    data: {
      id: uuidv7(),
      content: 'test thread',
      image: null,
      userId: userId,
    },
  });

  return result;
};

export default createThread;
