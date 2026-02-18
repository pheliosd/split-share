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
    fastify.log.error({ err: error, url: request.url, method: request.method });

    // AppError (our typed errors)
    if (error.name === 'AppError' || (error as any).isOperational) {
        return reply.status((error as any).statusCode || 400).send({
            error: {
                code: (error as any).code || 'APP_ERROR',
                message: error.message,
                statusCode: (error as any).statusCode || 400,
            },
        });
    }

    // Fastify validation errors (JSON Schema)
    if (error.validation) {
        return reply.status(422).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                statusCode: 422,
                details: error.validation,
            },
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return reply.status(401).send({
            error: {
                code: 'UNAUTHORIZED',
                message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
                statusCode: 401,
            },
        });
    }

    // Prisma errors
    if (error.constructor?.name?.startsWith('Prisma')) {
        const prismaCode = (error as any).code;
        if (prismaCode === 'P2002') {
            return reply.status(409).send({
                error: { code: 'CONFLICT', message: 'A record with this value already exists', statusCode: 409 },
            });
        }
        if (prismaCode === 'P2025') {
            return reply.status(404).send({
                error: { code: 'NOT_FOUND', message: 'Record not found', statusCode: 404 },
            });
        }
    }

    // Fastify built-in status errors (e.g. 404 from route not found)
    if (error.statusCode && error.statusCode < 500) {
        return reply.status(error.statusCode).send({
            error: {
                code: 'REQUEST_ERROR',
                message: error.message,
                statusCode: error.statusCode,
            },
        });
    }

    // Fallback: 500 Internal Server Error
    return reply.status(500).send({
        error: {
            code: 'INTERNAL_ERROR',
            message: config.nodeEnv === 'development' ? error.message : 'Internal server error',
            statusCode: 500,
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
