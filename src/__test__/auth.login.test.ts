import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/auth/login', () => {
  it('should login successfully and return user data', async () => {
    // 🔥 arrange
    const { user, plainPassword } = await createTestUser({
      email: 'kiko@gmail.com',
      username: 'kikotea',
      fullName: 'kiko12',
    });

    // 🔥 act
    const res = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    // 🔥 assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Login successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: null,
        name: user.fullName,
        accessToken: expect.any(String),
        bio: null,
        followers: expect.any(Number),
        following: expect.any(Number),
      },
    });
  });
});
