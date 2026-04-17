import { Worker } from 'bullmq';
import fs from 'fs';
import 'dotenv/config';
import prisma from '../config/prisma';
import { uploadToCloudinaryFromPath } from '../shared/utils/uploadImage';
import { bullmqWorkerRedis, workerPublisherRedis } from '../config/redis';

new Worker(
  'thread-queue',
  async (job) => {
    const { galleryId, filePath } = job.data;

    const result = await uploadToCloudinaryFromPath(filePath, 'avatars');

    const updated = await prisma.thread.update({
      where: { id: galleryId },
      data: { image: result.url },
    });

    fs.unlinkSync(filePath);

    // ✅ Publish ke Redis, bukan langsung io.emit()
    await workerPublisherRedis.publish(
      'thread:created',
      JSON.stringify(updated)
    );
  },
  { connection: bullmqWorkerRedis }
);
