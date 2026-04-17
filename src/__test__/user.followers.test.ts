import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import createFollow from './utils/createFollow';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/users/:username/followers', () => {
  it('should return list of followers', async () => {
    // 🔥 1. Arrange

    // user1 = follower
    const user1 = await createTestUser({
      username: 'follower1',
      fullName: 'Follower One',
    });

    // user2 = yang di-follow (target)
    const user2 = await createTestUser({
      username: 'targetuser',
      fullName: 'Target User',
    });

    // user1 follow user2
    await createFollow(user1.user.id, user2.user.id);

    // login (user bebas, pakai util kamu)
    const token = await getToken();

    // 🔥 2. Act
    const res = await request(app)
      .get(`/api/users/${user2.user.username}/followers`)
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: expect.any(String),
      data: [
        {
          id: user1.user.id,
          username: user1.user.username,
          name: user1.user.fullName,
          avatar: null,
          bio: null,
          isFollowing: expect.any(Boolean),
        },
      ],
    });
  });
});
