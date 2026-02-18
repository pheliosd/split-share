import { FastifyInstance } from 'fastify';
import { SettlementsController } from './settlements.controller';

export async function settlementsRoutes(fastify: FastifyInstance) {
    const controller = new SettlementsController();

    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    // Create settlement
    fastify.post('/', {
        schema: {
            description: 'Record a settlement/payment',
            tags: ['settlements'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['groupId', 'payerId', 'payeeId', 'amount'],
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                    payerId: { type: 'string', format: 'uuid' },
                    payeeId: { type: 'string', format: 'uuid' },
                    amount: { type: 'number', minimum: 0.01 },
                    currency: { type: 'string', default: 'USD' },
                    paymentMethod: { type: 'string' },
                    notes: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        settlement: { type: 'object' },
                    },
                },
            },
        },
    }, controller.createSettlement.bind(controller));

    // Get settlements
    fastify.get('/', {
        schema: {
            description: 'Get settlements with filters',
            tags: ['settlements'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    limit: { type: 'integer', default: 50 },
                    offset: { type: 'integer', default: 0 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        settlements: { type: 'array', items: { type: 'object' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                        hasMore: { type: 'boolean' },
                    },
                },
            },
        },
    }, controller.getSettlements.bind(controller));

    // Get settlement by ID
    fastify.get('/:settlementId', {
        schema: {
            description: 'Get settlement details',
            tags: ['settlements'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    settlementId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        settlement: { type: 'object' },
                    },
                },
            },
        },
    }, controller.getSettlement.bind(controller));

    // Delete settlement
    fastify.delete('/:settlementId', {
        schema: {
            description: 'Delete a settlement',
            tags: ['settlements'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    settlementId: { type: 'string', format: 'uuid' },
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
    }, controller.deleteSettlement.bind(controller));
}
