import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';
// import prisma from '../libs/prisma';

import slugify from 'slugify';

// ─── Google Strategy ───────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error('No email from Google'));

        // Cari atau buat user
        let user = await prisma.user.findUnique({ where: { email } });
        const baseUsername = slugify(profile.displayName, {
          lower: true,
          strict: true,
        });

        const random = Math.floor(1000 + Math.random() * 9000);
        const username = `${baseUsername}${random}`;

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName,
              username,
              photoProfile: profile.photos?.[0].value,
              accounts: {
                create: {
                  provider: 'google',
                  providerAccountId: profile.id,
                  accessToken,
                  refreshToken: refreshToken ?? null,
                },
              },
            },
          });
        } else {
          // User sudah ada, pastikan Account-nya terhubung
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: profile.id,
              },
            },
            update: { accessToken },
            create: {
              userId: user.id,
              provider: 'google',
              providerAccountId: profile.id,
              accessToken,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Untuk session-based auth (disederhanakan)
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
