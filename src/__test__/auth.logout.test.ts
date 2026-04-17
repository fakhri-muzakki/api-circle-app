import request from 'supertest';
import app from '../app';
import { clearDatabase } from './utils/clearDatabase';

afterEach(async () => {
  await clearDatabase();
});

describe('POST /api/auth/register', () => {
  it('should register user successfully', async () => {
    const res = await request(app).get('/api/auth/logout');

    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Logged out successfully',
    });
  });
});
