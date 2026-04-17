import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import createThread from './utils/createThread';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/likes', () => {
  it('should like thread successfully', async () => {
    // 🔥 1. Arrange

    // buat user + login
    const { user, plainPassword } = await createTestUser();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    // buat thread
    const thread = await createThread(user.id);

    // 🔥 2. Act
    const res = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        threadId: thread.id,
      });

    // 🔥 3. Assert
    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Like thread successfully',
      data: {
        id: expect.any(String),
        userId: user.id,
        threadId: thread.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: null,
      },
    });
  });
});
