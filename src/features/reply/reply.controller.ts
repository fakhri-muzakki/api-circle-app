import { type Request, type Response, type NextFunction } from 'express';
import prisma from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
// import { uploadImageToSupabase } from '../../shared/utils/uploadImage';
import { getIO } from '../../config/socket';
import { uploadImageToSupabase } from '../../shared/utils/uploadImageToSupabase';
import { uploadToCloudinary } from '../../shared/utils/cloudinaryUpload';

interface CreateReply {
  threadId: string;
  image: string;
  content: string;
}

export const createReply = async (
  req: Request<object, object, CreateReply>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, threadId } = req.body;
    const file = req.file;
    const user = req.user;

    let imageUrl: string | undefined;
    if (file) {
      const result = await uploadToCloudinary(file.buffer, 'avatars');
      imageUrl = result.url;
    }

    if (!user) {
      throw new AppError('Token is not found', 404);
    }

    const data = await prisma.reply.create({
      data: {
        content,
        image: imageUrl,
        threadId,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    const result = {
      id: data.id,
      avatar: data.user.photoProfile,
      image: data.image,
      username: data.user.username,
      name: data.user.fullName,
      content: data.content,
    };

    const io = getIO();
    io.emit('reply:created', result);

    return res.status(201).json({
      success: true,
      message: 'Created reply successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
