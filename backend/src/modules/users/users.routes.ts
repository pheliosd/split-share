import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller';

export async function usersRoutes(fastify: FastifyInstance) {
    const controller = new UsersController();

    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    // Profile routes
    fastify.get('/me', {
        schema: {
            description: 'Get current user profile',
            tags: ['users'],
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
    }, controller.getProfile.bind(controller));

    fastify.patch('/me', {
        schema: {
            description: 'Update user profile',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    avatarUrl: { type: 'string', format: 'uri' },
                    defaultCurrency: { type: 'string', minLength: 3, maxLength: 3 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: { type: 'object' },
                    },
                },
            },
        },
    }, controller.updateProfile.bind(controller));

    // Search users
    fastify.get('/search', {
        schema: {
            description: 'Search users by name or email',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                required: ['q'],
                properties: {
                    q: { type: 'string' },
                    limit: { type: 'number', default: 20 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        users: {
                            type: 'array',
                            items: { type: 'object' },
                        },
                    },
                },
            },
        },
    }, controller.searchUsers.bind(controller));

    // Friends routes
    fastify.get('/friends', {
        schema: {
            description: 'Get user friends list',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        friends: {
                            type: 'array',
                            items: { type: 'object' },
                        },
                    },
                },
            },
        },
    }, controller.getFriends.bind(controller));

    fastify.post('/friends', {
        schema: {
            description: 'Send friend request',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['friendId'],
                properties: {
                    friendId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, controller.addFriend.bind(controller));

    fastify.post('/friends/:friendshipId/accept', {
        schema: {
            description: 'Accept friend request',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    friendshipId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, controller.acceptFriend.bind(controller));

    fastify.delete('/friends/:userId', {
        schema: {
            description: 'Remove friend',
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, controller.removeFriend.bind(controller));
}
