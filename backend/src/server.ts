import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import config from './common/config';
import { initializeMongoDb } from './database/mongo/schemas';
import { authenticate } from './common/middlewares/auth.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { groupsRoutes } from './modules/groups/groups.routes';
import { expensesRoutes } from './modules/expenses/expenses.routes';
import { settlementsRoutes } from './modules/settlements/settlements.routes';

// Initialize Prisma Client
export const prisma = new PrismaClient({
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Redis Client
export const redis = new Redis(config.redisUrl);

// Initialize Fastify
const fastify = Fastify({
    logger: {
        level: config.nodeEnv === 'development' ? 'info' : 'error',
        transport: config.nodeEnv === 'development'
            ? { target: 'pino-pretty' }
            : undefined,
    },
});

// Register plugins
async function registerPlugins() {
    // CORS
    await fastify.register(cors, {
        origin: config.corsOrigin,
        credentials: true,
    });

    // Security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    });

    // Rate limiting
    await fastify.register(rateLimit, {
        max: config.rateLimitMax,
        timeWindow: config.rateLimitWindow,
        redis,
    });

    // JWT
    await fastify.register(jwt, {
        secret: config.jwtSecret,
        sign: {
            expiresIn: config.jwtAccessExpiry,
        },
    });

    // Multipart (file uploads)
    await fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
            files: 1,
        },
    });

    // WebSocket
    await fastify.register(websocket);
}

// Health check route
fastify.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
});

// API routes
fastify.get('/api/v1', async () => {
    return {
        message: 'Splitwise API v1',
        version: '1.0.0',
    };
});

// Register module routes
await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
await fastify.register(usersRoutes, { prefix: '/api/v1/users' });
await fastify.register(groupsRoutes, { prefix: '/api/v1/groups' });
await fastify.register(expensesRoutes, { prefix: '/api/v1/expenses' });
await fastify.register(settlementsRoutes, { prefix: '/api/v1/settlements' });

// Import and register activities routes
const { activitiesRoutes } = await import('./modules/activities/activities.routes');
await fastify.register(activitiesRoutes, { prefix: '/api/v1/activities' });

// Import and register analytics routes
const { analyticsRoutes } = await import('./modules/analytics/analytics.routes');
await fastify.register(analyticsRoutes, { prefix: '/api/v1/analytics' });

// Import and register export routes
const { exportRoutes } = await import('./modules/export/export.routes');
await fastify.register(exportRoutes, { prefix: '/api/v1/export' });

// Import and register currency routes
const { currencyRoutes } = await import('./modules/currency/currency.routes');
await fastify.register(currencyRoutes, { prefix: '/api/v1/currencies' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode || 500;

    reply.status(statusCode).send({
        error: {
            message: error.message,
            statusCode,
            ...(config.nodeEnv === 'development' && { stack: error.stack }),
        },
    });
});

// Start server
async function start() {
    try {
        // Register plugins
        await registerPlugins();

        // Initialize MongoDB
        await initializeMongoDb(config.mongoUrl);

        // Test database connections
        await prisma.$connect();
        fastify.log.info('PostgreSQL connected');

        await redis.ping();
        fastify.log.info('Redis connected');

        // Start listening
        await fastify.listen({
            port: config.port,
            host: config.host
        });

        fastify.log.info(`Server running on http://${config.host}:${config.port}`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    fastify.log.info('Shutting down gracefully...');

    await prisma.$disconnect();
    await redis.quit();
    await fastify.close();

    process.exit(0);
});

// Start the server
start();

export default fastify;
