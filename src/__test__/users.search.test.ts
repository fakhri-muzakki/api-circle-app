import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/search', () => {
  it('should return users based on username query', async () => {
    // 🔥 1. Arrange

    // user target (yang akan dicari)
    const { user } = await createTestUser({
      username: 'ujang',
      fullName: 'ujang4',
      email: 'ujang@gmail.com',
    });

    // user lain (noise data)
    await createTestUser({
      username: 'kiko',
      fullName: 'kiko12',
    });

    // ambil token
    const token = await getToken();

    // 🔥 2. Act
    const res = await request(app)
      .get('/api/users/search')
      .query({ q: 'ujang' })
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'search user successfully',
      data: expect.arrayContaining([
        expect.objectContaining({
          id: user.id,
          username: user.username,
          name: user.fullName,
          avatar: null,
          bio: null,
          isFollowing: false,
        }),
      ]),
    });
  });
});
