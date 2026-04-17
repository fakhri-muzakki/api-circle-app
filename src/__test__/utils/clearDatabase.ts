import prisma from '../../config/prisma';

export const clearDatabase = async () => {
  // urutan penting (child dulu)
  await prisma.like.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.following.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
};
