import { AppError } from '../errors/AppError';
import { supabase } from '../../config/supabase';

export const deleteImageFromSupabase = async (imageUrl: string) => {
  const bucket = process.env.SUPABASE_BUCKET!;
  const path = imageUrl.split(`/object/public/${bucket}/`)[1];

  if (!path) throw new AppError('Invalid image URL', 400);
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
};
