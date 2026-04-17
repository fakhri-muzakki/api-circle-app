import path from 'path';
import { supabase } from '../../config/supabase';

export const uploadImageToSupabase = async (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname);
  const fileName = `products/${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Karena bucket PUBLIC
  const { data } = supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .getPublicUrl(fileName);

  return data.publicUrl;
};
