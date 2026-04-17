import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('GET /api/users/:id', () => {
  it('should return user detail successfully', async () => {
    // 🔥 1. Arrange

    // buat user target
    const { user } = await createTestUser({
      email: 'ujang@gmail.com',
      username: 'ujang karbon',
      fullName: 'ujang',
    });

    // ambil token
    const token = await getToken();

    // 🔥 2. Act
    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Fetched user successfully',
      data: {
        id: user.id,
        username: user.username,
        name: user.fullName,
        email: user.email,
        avatar: null,
        bio: null,
        followers: 0,
        following: 0,
      },
    });
  });
});
