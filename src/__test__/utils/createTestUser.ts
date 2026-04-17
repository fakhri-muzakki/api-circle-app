import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';

type CreateTestUserParams = {
  email?: string;
  username?: string;
  fullName?: string;
  password?: string;
};

export const createTestUser = async ({
  email,
  username,
  fullName,
  password = 'Fakhri123$$',
}: CreateTestUserParams = {}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email ?? `user${Date.now()}@gmail.com`,
      username: username ?? `user${Date.now()}`,
      fullName: fullName ?? 'test user',
      password: hashedPassword,
    },
  });

  return {
    user,
    plainPassword: password, // 🔥 penting untuk login test
  };
};
