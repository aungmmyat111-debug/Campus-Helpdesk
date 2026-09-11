import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import prisma from './prisma';
import ticketRoutes from './routes/ticket.routes';
import authRoutes from './routes/auth.routes';
import p2pRoutes from './routes/p2p.routes';
import { initSocket } from './services/socket.service';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Console log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Campus Helpdesk API Server' });
});

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running healthily!',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/p2p', p2pRoutes);

// Start Server with WebSocket attachment
const runningServer = server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down...');
  runningServer.close(async () => {
    await prisma.$disconnect();
    console.log('✅ MySQL/Prisma disconnected. Server terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ...
app.use('/api/users', userRoutes);