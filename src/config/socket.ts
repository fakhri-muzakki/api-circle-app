import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socketSubscriberRedis } from './redis';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL, // ganti dengan frontend URL di production
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Subscribe ke channel Redis
  socketSubscriberRedis.subscribe('thread:created', (err) => {
    if (err) console.error('Redis subscribe error:', err);
  });

  // Ketika worker publish → Express terima → forward ke frontend
  socketSubscriberRedis.on('message', (channel, message) => {
    if (channel === 'thread:created') {
      const data = JSON.parse(message);
      io.emit('thread:created', data); // ✅ Ini jalan di proses Express
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    if (process.env.NODE_ENV === 'test') {
      return {
        emit: () => {}, // noop
      } as any;
    } else {
      throw new Error('Socket.io not initialized');
    }
  }
  return io;
};
