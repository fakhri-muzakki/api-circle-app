import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import getToken from './utils/getToken';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('PUT /api/users/:id', () => {
  it('should return list of users', async () => {
    // Buat user
    const { user, plainPassword } = await createTestUser();

    // login, pake token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    const editName = 'test99999';

    // request
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: editName,
      });

    // expect response
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: expect.any(String),
      data: {
        id: user.id,
        username: user.username,
        fullName: editName,
        email: user.email,
        photoProfile: user.photoProfile,
        bio: user.bio,
        createdAt: res.body.data.createdAt,
        updatedAt: res.body.data.updatedAt,
      },
    });
  });
});
