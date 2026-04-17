import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/follows', () => {
  it('should create follow successfully', async () => {
    // 🔥 1. Arrange

    // buat 2 user
    const { user: follower } = await createTestUser({
      username: 'follower',
      fullName: 'Follower User',
    });

    const { user: following } = await createTestUser({
      username: 'following',
      fullName: 'Following User',
    });

    // ambil token (user login)
    const token = await getToken();

    // 🔥 2. Act
    const res = await request(app)
      .post('/api/follows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        followerId: follower.id,
        followingId: following.id,
      });

    // 🔥 3. Assert
    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Created follow successfully',
      data: {
        id: expect.any(String),
        followingId: following.id,
        followerId: follower.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });
});
