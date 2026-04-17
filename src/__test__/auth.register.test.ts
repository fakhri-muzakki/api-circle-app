import request from 'supertest';
import app from '../app';

import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/auth/register', () => {
  it('should register user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'ujang@gmail.com',
      password: 'Fakhri123$$',
      username: 'ujang karbon',
      fullName: 'ujang',
    });

    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      success: true,
      message: 'berhasil',
      data: {
        id: expect.any(String),
        username: 'ujang karbon',
        fullName: 'ujang',
        email: 'ujang@gmail.com',
        photoProfile: null,
        bio: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: null,
      },
    });
  });
});
