import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import prisma from './prisma';
import ticketRoutes from './routes/ticket.routes';
import authRoutes from './routes/auth.routes';
import p2pRoutes from './routes/p2p.routes';
import userRoutes from './routes/user.routes';
import { initSocket } from './services/socket.service';
import { getSecret } from './config/keyVault';

const app = express();
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
app.use('/api/users', userRoutes);

// Initialize Secrets and Start Server
async function startServer() {
  try {
    console.log('🔑 Fetching configuration secrets directly from Azure Key Vault...');

    // Load secrets dynamically into runtime memory
    process.env.DATABASE_URL = await getSecret('DATABASE-URL');
    process.env.JWT_SECRET = await getSecret('JWT-SECRET');
    process.env.GROQ_API_KEY = await getSecret('GROQ-API-KEY');
    process.env.P2P_SECRET = await getSecret('P2P-SECRET');
    process.env.AZURE_AD_CLIENT_ID = await getSecret('AZURE-AD-CLIENT-ID');
    process.env.AZURE_AD_CLIENT_SECRET = await getSecret('AZURE-AD-CLIENT-SECRET');
    process.env.AZURE_AD_TENANT_ID = await getSecret('AZURE-AD-TENANT-ID');
    process.env.AZURE_AD_REDIRECT_URI = await getSecret('AZURE-AD-REDIRECT-URI');
    process.env.FRONTEND_URL = await getSecret('FRONTEND-URL');

    const vaultPort = await getSecret('PORT');
    const PORT = Number(vaultPort) || 5001;

    const runningServer = server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server authenticated with Azure Key Vault & running on port ${PORT}`);
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

  } catch (error) {
    console.error('❌ Failed to load secrets from Azure Key Vault. Startup aborted:', error);
    process.exit(1);
  }
}

startServer();