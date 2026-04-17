import fs from 'fs';
import path from 'path';
import { supabase } from '../../config/supabase';
import cloudinary from '../../config/cloudinary';

export const uploadImageFromPath = async (filePath: string) => {
  const buffer = fs.readFileSync(filePath);

  const ext = path.extname(filePath);
  const fileName = `products/${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .getPublicUrl(fileName);

  return data.publicUrl;
};

interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinaryFromPath = (
  // buffer: Buffer,
  filePath: string,
  folder: string
): Promise<UploadResult> => {
  const buffer = fs.readFileSync(filePath);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder, // contoh: "threads", "avatars"
        resource_type: 'image',
        transformation: [
          { quality: 'auto' }, // auto compress
          { fetch_format: 'auto' }, // auto pilih format terbaik (webp di browser modern)
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer); // kirim buffer ke cloudinary
  });
};
