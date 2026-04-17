import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('DELETE /api/follows/:id', () => {
  it('should delete follow successfully', async () => {
    // 🔥 1. Arrange

    // buat follower (yang login)
    const { user: follower, plainPassword } = await createTestUser();

    // buat following
    const { user: following } = await createTestUser();

    // login sebagai follower
    const loginRes = await request(app).post('/api/auth/login').send({
      email: follower.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    // buat follow dulu
    const followRes = await request(app)
      .post('/api/follows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        followerId: follower.id,
        followingId: following.id,
      });

    const followId = followRes.body.data.id;

    // 🔥 2. Act (delete follow)
    const res = await request(app)
      .delete(`/api/follows/${followId}`)
      .set('Authorization', `Bearer ${token}`);

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Deleted follow successfully',
    });
  });
});
