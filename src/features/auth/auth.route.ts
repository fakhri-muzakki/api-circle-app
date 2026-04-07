import { Router } from 'express';
import {
  callbackGooleAndGithub,
  login,
  logout,
  register,
} from './auth.controller';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema, registerSchema } from './auth.validation';
import passport from 'passport';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/logout', logout);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/google/callback',
  // '/callback/google',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failed',
  }),
  callbackGooleAndGithub
);

router.get('/failed', (req, res) => {
  return res.status(401).json({ message: 'Authentication failed' });
});

export default router;
