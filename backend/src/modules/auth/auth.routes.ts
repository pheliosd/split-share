import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
    const controller = new AuthController();

    // Public routes
    fastify.post('/register', {
        schema: {
            description: 'Register a new user',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string' },
                    defaultCurrency: { type: 'string', default: 'USD' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        user: { type: 'object' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                },
            },
        },
    }, controller.register.bind(controller));

    fastify.post('/login', {
        schema: {
            description: 'Login with email and password',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: { type: 'object' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                },
            },
        },
    }, controller.login.bind(controller));

    fastify.post('/oauth/:provider', {
        schema: {
            description: 'OAuth login (Google/Apple)',
            tags: ['auth'],
            params: {
                type: 'object',
                properties: {
                    provider: { type: 'string', enum: ['google', 'apple'] },
                },
            },
            body: {
                type: 'object',
                required: ['idToken'],
                properties: {
                    idToken: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: { type: 'object' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                },
            },
        },
    }, controller.oauthLogin.bind(controller));

    fastify.post('/refresh', {
        schema: {
            description: 'Refresh access token',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                },
            },
        },
    }, controller.refresh.bind(controller));

    // Protected routes
    fastify.post('/logout', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Logout current user',
            tags: ['auth'],
            security: [{ bearerAuth: [] }],
        },
    }, controller.logout.bind(controller));

    fastify.get('/me', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Get current user',
            tags: ['auth'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: { type: 'object' },
                    },
                },
            },
        },
    }, controller.me.bind(controller));

    fastify.post('/change-password', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Change user password',
            tags: ['auth'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 8 },
                },
            },
        },
    }, controller.changePassword.bind(controller));
}
