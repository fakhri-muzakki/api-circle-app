import request from 'supertest';
import app from '../app';
import { createTestUser } from './utils/createTestUser';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/threads', () => {
  it('should create thread successfully', async () => {
    // 🔥 1. Arrange

    // buat user + login
    const { user, plainPassword } = await createTestUser();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    const token = loginRes.body.data.accessToken;

    // 🔥 2. Act
    const res = await request(app)
      .post('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'test123',
      });

    // 🔥 3. Assert
    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Created thread successfully',
      data: {
        id: expect.any(String),
        image: null,
        content: 'test123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: null,
        userId: user.id,
      },
    });
  });
});
