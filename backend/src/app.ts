import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env, isDevelopment } from './config/env';
import { connectRedis } from './config/redis';
import prisma from './config/database';
import { AppError } from './utils/errors';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import itemRoutes from './routes/item.routes';

// Initialize Express app
const app: Application = express();

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.server.nodeEnv,
  });
});

// API v1 routes
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'Xchange API v1',
    version: '0.1.0',
    documentation: '/api/v1/docs',
  });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// User routes
app.use('/api/v1/users', userRoutes);

// Category routes
app.use('/api/v1/categories', categoryRoutes);

// Item routes
app.use('/api/v1/items', itemRoutes);

// TODO: Add more route modules
// app.use('/api/v1/listings', listingRoutes);
// app.use('/api/v1/barter', barterRoutes);
// app.use('/api/v1/auctions', auctionRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(isDevelopment && { stack: err.stack }),
      },
    });
  }

  // Handle other errors
  if (isDevelopment) {
    res.status(500).json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
      },
    });
  }
});

// ============================================
// Server Startup
// ============================================

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start Express server
    app.listen(env.server.port, () => {
      console.log(`🚀 Server running on port ${env.server.port}`);
      console.log(`🌍 Environment: ${env.server.nodeEnv}`);
      console.log(`📍 API URL: ${env.server.apiUrl}`);
      console.log(`🔗 Health check: ${env.server.apiUrl}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
