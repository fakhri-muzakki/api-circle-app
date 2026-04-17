import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import createThread from './utils/createThread';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/threads', () => {
  it('should return list of threads', async () => {
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

    // buat 1 thread pakai util
    const thread = await createThread(user.id);

    // 🔥 2. Act
    const res = await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Fetched threads successfully ',
      data: expect.arrayContaining([
        expect.objectContaining({
          id: thread.id,
          name: user.fullName,
          username: user.username,
          image: null,
          avatar: null,
          content: thread.content,
          likes: 0,
          comments: 0,
          isLiked: false,
          time: expect.any(String),
        }),
      ]),
    });
  });
});
