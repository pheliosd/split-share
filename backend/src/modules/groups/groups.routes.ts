import { FastifyInstance } from 'fastify';
import { GroupsController } from './groups.controller';

export async function groupsRoutes(fastify: FastifyInstance) {
    const controller = new GroupsController();

    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    // Create group
    fastify.post('/', {
        schema: {
            description: 'Create a new group',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name', 'memberIds'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string', enum: ['trip', 'home', 'couple', 'office', 'other'] },
                    currency: { type: 'string', default: 'USD' },
                    memberIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                    parentGroupId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        group: { type: 'object' },
                    },
                },
            },
        },
    }, controller.createGroup.bind(controller));

    // Get user's groups
    fastify.get('/', {
        schema: {
            description: 'Get all groups for current user',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        groups: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    }, controller.getGroups.bind(controller));

    // Get group by ID
    fastify.get('/:groupId', {
        schema: {
            description: 'Get group details',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        group: { type: 'object' },
                    },
                },
            },
        },
    }, controller.getGroup.bind(controller));

    // Update group
    fastify.patch('/:groupId', {
        schema: {
            description: 'Update group settings (admin only)',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    simplifyDebts: { type: 'boolean' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        group: { type: 'object' },
                    },
                },
            },
        },
    }, controller.updateGroup.bind(controller));

    // Add members
    fastify.post('/:groupId/members', {
        schema: {
            description: 'Add members to group (admin only)',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                required: ['userIds'],
                properties: {
                    userIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        members: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    }, controller.addMembers.bind(controller));

    // Remove member
    fastify.delete('/:groupId/members/:userId', {
        schema: {
            description: 'Remove member from group',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
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
    }, controller.removeMember.bind(controller));

    // Archive group
    fastify.post('/:groupId/archive', {
        schema: {
            description: 'Archive group (admin only)',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        group: { type: 'object' },
                    },
                },
            },
        },
    }, controller.archiveGroup.bind(controller));

    // Get balances
    fastify.get('/:groupId/balances', {
        schema: {
            description: 'Get group balances and simplified debts',
            tags: ['groups'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        balances: { type: 'array', items: { type: 'object' } },
                        simplifiedDebts: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    }, controller.getBalances.bind(controller));
}
