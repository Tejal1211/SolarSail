import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db/connection.js';
import { config, validateConfig } from './config/environment.js';
import {
  securityHeaders,
  apiLimiter,
  corsConfig,
  validateJsonPayload,
  sanitizeInput,
} from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import carbonRoutes from './routes/carbonRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import missionRoutes from './routes/missionRoutes.js';

const app = express();

/**
 * Middleware Setup
 */

// Validate environment
validateConfig();

// Security
app.use(securityHeaders);
app.use(cors(corsConfig));

// Logging
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input validation
app.use(validateJsonPayload);
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', apiLimiter);

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/missions', missionRoutes);

/**
 * Error Handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Database Connection & Server Start
 */
export async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    const PORT = config.PORT;
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║     🚀 SolarSail Server Started      ║
╠══════════════════════════════════════╣
║ Environment: ${config.NODE_ENV.padEnd(28)} ║
║ Port: ${PORT.toString().padEnd(33)} ║
║ URL: http://localhost:${PORT}          ║
╚══════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

export default app;
