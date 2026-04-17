import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import createThread from './utils/createThread';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/users/:username/threads', () => {
  it('should return user threads successfully', async () => {
    // 🔥 1. Arrange

    // buat user target
    const { user } = await createTestUser({
      username: 'ujanga',
      fullName: 'ujang4a',
    });

    // login (boleh user lain, tapi kita pakai user yang sama biar simple)
    const { plainPassword } = await createTestUser();
    const loginUser = await createTestUser();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: loginUser.user.email,
      password: loginUser.plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    // buat beberapa thread milik user target
    const thread1 = await createThread(user.id);
    const thread2 = await createThread(user.id);

    // 🔥 2. Act
    const res = await request(app)
      .get(`/api/users/${user.username}/threads`)
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Fetched threads successfully',
      data: {
        id: user.id,
        name: user.fullName,
        username: user.username,
        avatar: null,
        bio: null,
        following: expect.any(Number),
        followers: expect.any(Number),
        isFollowing: expect.any(Boolean),

        threads: expect.arrayContaining([
          expect.objectContaining({
            id: thread1.id,
            name: user.fullName,
            username: user.username,
            avatar: null,
            content: thread1.content,
            image: null,
            likes: expect.any(Number),
            comments: expect.any(Number),
            isLiked: expect.any(Boolean),
            time: expect.any(String),
          }),
          expect.objectContaining({
            id: thread2.id,
            name: user.fullName,
            username: user.username,
            avatar: null,
            content: thread2.content,
            image: null,
            likes: expect.any(Number),
            comments: expect.any(Number),
            isLiked: expect.any(Boolean),
            time: expect.any(String),
          }),
        ]),
      },
    });
  });
});
