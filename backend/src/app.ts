import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env, isDevelopment } from './config/env';
import { connectRedis } from './config/redis';
import prisma from './config/database';
import { AppError } from './utils/errors';
import logger from './lib/logger';
import { sentryErrorHandler, sentryRequestHandler } from './lib/sentry';
import {
  getHealthStatus,
  getPerformanceStats,
  startHealthMonitoring,
} from './lib/monitoring';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  createContentLimiter,
  auctionBidLimiter,
  chatLimiter,
  transactionLimiter,
  aiLimiter,
  notificationLimiter,
  sensitiveOperationsLimiter,
  reportLimiter,
  comparisonLimiter,
  walletLimiter,
  adminLimiter,
  sanitizeInput,
  additionalSecurityHeaders,
  securityLogger,
  bruteForceProtection,
  requestLogger,
} from './middleware/security';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import itemRoutes from './routes/item.routes';
import listingRoutes from './routes/listing.routes';
import transactionRoutes from './routes/transaction.routes';
import barterRoutes from './routes/barter.routes';
import auctionRoutes from './routes/auction.routes';
import reverseAuctionRoutes from './routes/reverse-auction.routes';
import imageRoutes from './routes/image.routes';
import notificationRoutes from './routes/notification.routes';
import reviewRoutes from './routes/review.routes';
import searchRoutes from './routes/search.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import seedRoutes from './routes/seed.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import pushRoutes from './routes/push.routes';
import aiRoutes from './routes/ai.routes';
import inventoryRoutes from './routes/inventory.routes';
import locationsRoutes from './routes/locations.routes';
import demandMarketplaceRoutes from './routes/demand-marketplace.routes';
import flashDealsRoutes from './routes/flash-deals.routes';
import escrowRoutes from './routes/escrow.routes';
import barterPoolRoutes from './routes/barter-pool.routes';
import facilitatorRoutes from './routes/facilitator.routes';
import aiAssistantRoutes from './routes/ai-assistant.routes';
import aiListingRoutes from './routes/ai-listing.routes';
import walletRoutes from './routes/wallet.routes';
import exchangePointsRoutes from './routes/exchange-points.routes';
import searchAlertsRoutes from './routes/search-alerts.routes';
import scrapMarketplaceRoutes from './routes/scrap-marketplace.routes';
import matchingRoutes from './routes/matching.routes';
import propertyRoutes from './routes/property.routes';
import comparisonRoutes from './routes/comparison.routes';
import deliveryRoutes from './routes/delivery.routes';
import installmentRoutes from './routes/installment.routes';
import badgeRoutes from './routes/badge.routes';
import goldRoutes from './routes/gold.routes';
import silverRoutes from './routes/silver.routes';
import carsRoutes from './routes/cars.routes';
import mobileRoutes from './routes/mobile.routes';
import marketsRoutes from './routes/markets.routes';
import ratingsRoutes from './routes/ratings.routes';
import tenderAdvancedRoutes from './routes/tender-advanced.routes';
import transportRoutes from './routes/transport.routes';
import adminPricingRoutes from './routes/admin-pricing.routes';
import aiAdvancedRoutes from './routes/ai-advanced.routes';
import boardRoutes from './routes/board.routes';
import founderRoutes from './routes/founder.routes';
import docsRoutes from './routes/docs.routes';
import watchlistRoutes from './routes/watchlist.routes';
import pricePredictionRoutes from './routes/price-prediction.routes';

// Import background jobs
import { startBarterMatcherJob } from './jobs/barterMatcher.job';
import { startLockCleanupJob } from './jobs/lockCleanup.job';
import { startAutonomousBoardJobs, runMorningIntelligence } from './jobs/autonomousBoard.job';
import { initializeDailyMeetingsOnStartup } from './services/autonomous-board';

// Import real-time matching
import { initializeWebSocket, startRealtimeMatching } from './services/realtime-matching.service';

// Import chat WebSocket service
import { attachChatEventHandlers } from './services/socket.service';

// Import smart matching service (consolidated notification logic)
import { initSmartMatchingListeners } from './services/smart-matching.service';

// Import unified matching service (improved matching orchestrator)
import { initUnifiedMatching } from './services/unified-matching.service';

// Initialize Express app
const app: Application = express();

// Create HTTP server for Socket.IO
const httpServer = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins for Socket.IO (same logic as REST API)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = env.cors.origin;
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return false;
      });

      const isVercel = origin.endsWith('.vercel.app');
      const isLocalhost = origin.includes('localhost');

      if (isAllowed || isVercel || isLocalhost) {
        callback(null, true);
      } else {
        logger.warn(`Socket.IO CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// ============================================
// Middleware
// ============================================
// Trust proxy - Required for Railway/production deployment
app.set('trust proxy', 1);

// Sentry request handler (for performance tracking) - must be first
app.use(sentryRequestHandler);

// Security headers (Helmet + additional)
// CSP is relaxed for /api/v1/docs (Swagger UI requires inline scripts/styles)
// All other routes use strict CSP
app.use((req, res, next) => {
  const isDocsRoute = req.path.startsWith('/api/v1/docs');

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Swagger UI needs unsafe-inline, other routes don't
        styleSrc: isDocsRoute
          ? ["'self'", "'unsafe-inline'", 'https://unpkg.com']
          : ["'self'"],
        scriptSrc: isDocsRoute
          ? ["'self'", "'unsafe-inline'", 'https://unpkg.com']
          : ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'https:'],
        // Additional security directives
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for images from external sources
    // Additional Helmet settings
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })(req, res, next);
});
app.use(additionalSecurityHeaders);

// Security logging (detect suspicious requests)
app.use(securityLogger);

// Request logging (monitor all requests/responses)
app.use(requestLogger);

// Input sanitization (prevent XSS)
app.use(sanitizeInput);

// Compression - reduce response size
app.use(compression());

// CORS configuration - Strict in production, flexible in development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin matches allowed patterns from environment config
      const allowedOrigins = env.cors.origin;
      const isExplicitlyAllowed = allowedOrigins.some((allowed) => {
        // Exact match
        if (allowed === origin) return true;

        // Wildcard pattern matching for specified domains
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }

        return false;
      });

      // In development only: allow localhost and Vercel preview deployments
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isVercelPreview = origin.endsWith('.vercel.app');
      const allowDevOrigins = isDevelopment && (isLocalhost || isVercelPreview);

      if (isExplicitlyAllowed || allowDevOrigins) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`, {
          blockedOrigin: origin,
          environment: env.server.nodeEnv,
        });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Root route - Welcome message
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'مرحباً بك في منصة Xchange للتجارة الإلكترونية',
    welcomeMessage: 'Welcome to Xchange E-commerce Platform',
    version: '0.1.1',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs'
    }
  });
});

// Health check - Basic
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.server.nodeEnv,
    uptime: process.uptime(),
  });
});

// Health check - Detailed with all services
app.get('/health/detailed', async (_req: Request, res: Response) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Performance metrics endpoint (for monitoring dashboards)
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const stats = await getPerformanceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get performance stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness probe (for Kubernetes/Railway)
app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('OK');
  } catch {
    res.status(503).send('Not Ready');
  }
});

// API v1 routes
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'Xchange API v1',
    version: '0.1.1',
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

// Listing routes
app.use('/api/v1/listings', listingRoutes);

// Transaction routes (with transaction rate limiter)
app.use('/api/v1/transactions', transactionLimiter, transactionRoutes);

// Barter routes
app.use('/api/v1/barter', barterRoutes);

// Auction routes (with bid rate limiter)
app.use('/api/v1/auctions', auctionBidLimiter, auctionRoutes);

// Reverse Auction routes (with bid rate limiter)
app.use('/api/v1/reverse-auctions', auctionBidLimiter, reverseAuctionRoutes);

// Image routes
app.use('/api/v1/images', imageRoutes);

// Notification routes (with notification rate limiter)
app.use('/api/v1/notifications', notificationLimiter, notificationRoutes);

// Review routes
app.use('/api/v1/reviews', reviewRoutes);

// Search routes (with search rate limiter)
app.use('/api/v1/search', searchLimiter, searchRoutes);

// Chat routes (with chat rate limiter)
app.use('/api/v1/chat', chatLimiter, chatRoutes);

// Admin routes (for retroactive matching, etc.)
app.use('/api/v1/admin', adminLimiter, adminRoutes);

// TEMPORARY: Seed routes (DELETE AFTER USE)
app.use('/api/v1/seed', seedRoutes);

// Cart routes
app.use('/api/v1/cart', cartRoutes);

// Order routes
app.use('/api/v1/orders', orderRoutes);

// Payment routes (with wallet rate limiter)
app.use('/api/v1/payment', walletLimiter, paymentRoutes);

// Push notification routes
app.use('/api/v1/push', pushRoutes);

// AI features routes (FREE services) - with AI rate limiter
app.use('/api/v1/ai', aiLimiter, aiRoutes);

// Inventory routes
app.use('/api/v1/inventory', inventoryRoutes);

// Locations routes (Egyptian governorates, cities, districts)
app.use('/api/v1/locations', locationsRoutes);

// Demand Marketplace routes (unified demand items: barter requests + reverse auctions)
app.use('/api/v1/demand', demandMarketplaceRoutes);

// Flash Deals
app.use('/api/v1/flash-deals', flashDealsRoutes);

// Escrow System (Smart Escrow & Disputes) - with transaction limiter
app.use('/api/v1/escrow', transactionLimiter, escrowRoutes);

// Barter Pools (Collective Barter)
app.use('/api/v1/barter-pools', barterPoolRoutes);

// Facilitators Network
app.use('/api/v1/facilitators', facilitatorRoutes);

// AI Assistant (with AI rate limiter)
app.use('/api/v1/ai-assistant', aiLimiter, aiAssistantRoutes);

// AI Listing (Sell with AI) - with AI rate limiter
app.use('/api/v1/ai-listing', aiLimiter, aiListingRoutes);

// XChange Wallet (with wallet rate limiter)
app.use('/api/v1/wallet', walletLimiter, walletRoutes);

// Exchange Points (Safe meetup locations)
app.use('/api/v1/exchange-points', exchangePointsRoutes);

// Search Alerts
app.use('/api/v1/search-alerts', searchAlertsRoutes);

// Scrap Marketplace routes - سوق التوالف
app.use('/api/v1/scrap', scrapMarketplaceRoutes);

// Matching routes - نظام المطابقة الذكية
app.use('/api/v1/matching', matchingRoutes);

// Real Estate / Property Marketplace routes - سوق العقارات
app.use('/api/v1/properties', propertyRoutes);

// Item Comparison routes - نظام مقارنة المنتجات (with comparison limiter)
app.use('/api/v1/comparisons', comparisonLimiter, comparisonRoutes);

// Delivery routes - خدمة التوصيل المدمجة
app.use('/api/v1/delivery', deliveryRoutes);

// Installment routes - خدمة التقسيط (Valu وغيرها)
app.use('/api/v1/installments', installmentRoutes);

// Badge routes - شارات التحقق
app.use('/api/v1/badges', badgeRoutes);

// Gold Marketplace - سوق الذهب
app.use('/api/v1/gold', goldRoutes);

// Silver Marketplace - سوق الفضة
app.use('/api/v1/silver', silverRoutes);

// Cars Marketplace - سوق السيارات
app.use('/api/v1/cars', carsRoutes);

// Mobile Marketplace Routes - سوق الموبايلات
app.use('/api/v1/mobiles', mobileRoutes);

// Markets - نقاط API الموحدة للأسواق
app.use('/api/v1/markets', marketsRoutes);

// Ratings - نظام التقييم الموحد
app.use('/api/v1/ratings', ratingsRoutes);

// Tenders Advanced - خدمات المناقصات المتقدمة
app.use('/api/v1/tenders', tenderAdvancedRoutes);

// Transport - نظام النقل الذكي ومقارنة الأسعار
app.use('/api/v1/transport', transportRoutes);

// Admin Pricing - إدارة التسعير والذكاء الاصطناعي (with admin rate limiter)
app.use('/api/v1/admin/pricing', adminLimiter, adminPricingRoutes);

// Advanced AI Features - الذكاء الاصطناعي المتقدم (with AI rate limiter)
app.use('/api/v1/ai-advanced', aiLimiter, aiAdvancedRoutes);

// AI Board of Directors - مجلس إدارة AI
app.use('/api/v1/board', boardRoutes);

// Founder Portal - بوابة المؤسس
app.use('/api/v1/founder', founderRoutes);

// API Documentation - توثيق API
app.use('/api/v1/docs', docsRoutes);

// Watchlist / Favorites - قائمة المتابعة
app.use('/api/v1/watchlist', watchlistRoutes);

// Price Prediction - التنبؤ بالأسعار
app.use('/api/v1/price-prediction', pricePredictionRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Sentry error handler (must be before global error handler)
app.use(sentryErrorHandler);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error:', err);

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
    logger.info('Database connected');

    // Initialize WebSocket for real-time matching
    initializeWebSocket(io);
    logger.info('WebSocket server initialized');

    // Attach chat event handlers to WebSocket
    attachChatEventHandlers(io);
    logger.info('Chat WebSocket handlers attached');

    // Start real-time matching service
    startRealtimeMatching();
    logger.info('Real-time matching service started');

    // Initialize smart matching listeners (legacy - kept for backwards compatibility)
    initSmartMatchingListeners();
    logger.info('Smart matching notification service started');

    // Initialize unified matching service (improved orchestrator with geographic priority)
    initUnifiedMatching(io);
    logger.info('Unified matching service started');

    // Start background jobs (kept for fallback and cleanup)
    if (env.server.nodeEnv === 'production') {
      startBarterMatcherJob(); // Runs every 15 minutes as fallback
      startLockCleanupJob();   // Runs every 5 minutes for cleanup
    }

    // Start Autonomous AI Board scheduled jobs
    startAutonomousBoardJobs();
    logger.info('Autonomous AI Board jobs scheduled');

    // Initialize daily meetings at startup (ensures meetings exist even if cron hasn't run)
    initializeDailyMeetingsOnStartup()
      .then(() => logger.info('Daily meetings initialized at startup'))
      .catch(err => logger.error('Failed to initialize daily meetings:', err));

    // Start health monitoring (checks every 60 seconds)
    if (env.server.nodeEnv === 'production') {
      startHealthMonitoring(60000);
    }

    // Start HTTP server (Express + Socket.IO) - listen on 0.0.0.0 for Railway compatibility
    httpServer.listen(env.server.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${env.server.port}`);
      logger.info(`Environment: ${env.server.nodeEnv}`);
      logger.info(`API URL: ${env.server.apiUrl}`);
      logger.info(`Health check: ${env.server.apiUrl}/health`);
      logger.info(`Metrics: ${env.server.apiUrl}/metrics`);
      logger.info(`WebSocket available on ws://${env.server.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start the server
startServer();

export default app;
export { io };
