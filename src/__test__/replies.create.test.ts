import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import createThread from './utils/createThread';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/replies', () => {
  it('should create reply successfully', async () => {
    // 🔥 1. Arrange

    // buat user + login
    const { user, plainPassword } = await createTestUser({
      username: 'ujanga',
      fullName: 'ujang4a',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    // buat thread
    const thread = await createThread(user.id);

    // 🔥 2. Act
    const res = await request(app)
      .post('/api/replies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        threadId: thread.id,
        content: 'test 123',
      });

    // 🔥 3. Assert
    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Created reply successfully',
      data: {
        id: expect.any(String),
        avatar: null,
        image: null,
        username: user.username,
        name: user.fullName,
        content: 'test 123',
      },
    });
  });
});
