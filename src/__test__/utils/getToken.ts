import { createTestUser } from './createTestUser';
import request from 'supertest';
import app from '../../app';

const getToken = async () => {
  const { user: loginUser, plainPassword } = await createTestUser({
    email: 'login@gmail.com',
    username: 'loginuser',
    fullName: 'Login User',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: loginUser.email,
    password: plainPassword,
  });

  const token = loginRes.body.data.accessToken;
  return token;
};

export default getToken;
