export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    cookies: AuthCookies;
    user?: JwtPayload;
  }
}
