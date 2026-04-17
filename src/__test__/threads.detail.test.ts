import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import { clearDatabase } from './utils/clearDatabase';
import createThread from './utils/createThread';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/threads/:id', () => {
  it('should return thread detail successfully', async () => {
    // buat user + login
    const { user, plainPassword } = await createTestUser();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    const { id: threadId } = await createThread(user.id);

    // 🔥 2. Act
    const res = await request(app)
      .get(`/api/threads/${threadId}`)
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Fetched thread with replies successfully',
      data: {
        id: threadId,
        content: 'test thread',
        image: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: null,
        userId: user.id,

        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          password: expect.any(String),
          photoProfile: null,
          bio: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: null,
        },

        isLiked: expect.any(Boolean),
        likes: expect.any(Number),
        comments: expect.any(Number),
        time: expect.any(String),
        avatar: null,
        name: user.fullName,
        username: user.username,
        replies: expect.any(Array),
      },
    });
  });
});
