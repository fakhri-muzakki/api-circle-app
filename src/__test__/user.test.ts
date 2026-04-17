import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/users', () => {
  it('should return list of users', async () => {
    // 🔥 1. Arrange

    // user yang login

    // user lain (data list)
    const user1 = await createTestUser({
      username: 'ujang karbon',
      fullName: 'ujang',
    });

    const user2 = await createTestUser({
      username: 'kikotea',
      fullName: 'kiko12',
    });

    // 🔥 2. Login untuk dapat token

    const token = await getToken();

    // 🔥 3. Hit endpoint
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    // 🔥 4. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Get users successfully',
      data: expect.arrayContaining([
        expect.objectContaining({
          id: user1.user.id,
          username: user1.user.username,
          name: user1.user.fullName,
          avatar: null,
          bio: null,
          isFollowing: false,
        }),
        expect.objectContaining({
          id: user2.user.id,
          username: user2.user.username,
          name: user2.user.fullName,
          avatar: null,
          bio: null,
          isFollowing: false,
        }),
      ]),
      nextCursor: null,
    });
  });
});
