import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(5, 'Name minimal 5 karakter')
    .max(50, 'Name maksimal 50 karakter'),
  fullName: z
    .string()
    .min(5, 'Name minimal 5 karakter')
    .max(50, 'Name maksimal 50 karakter'),

  email: z.email('Format email tidak valid'),

  password: z
    .string('Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(64, 'Password maksimal 64 karakter')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      'Password harus mengandung huruf besar, huruf kecil, dan angka'
    ),
});

// ✨ Auto type inference!
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('Format email tidak valid'),

  password: z
    .string('Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(64, 'Password maksimal 64 karakter')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      'Password harus mengandung huruf besar, huruf kecil, dan angka'
    ),
});

// ✨ Auto type inference!
export type LoginInput = z.infer<typeof loginSchema>;
