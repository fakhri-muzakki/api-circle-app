import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport';

// Import middleware
import { notFound, errorHandler } from './shared/middlewares';
import router from './router';

const app = express();

// Security middleware
// app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend kamu
    credentials: true, // kalau pakai cookie / auth
  })
);

app.use(passport.initialize());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api', router);

// Error handling middleware (harus di akhir)
app.use(notFound);
app.use(errorHandler);

export default app;
