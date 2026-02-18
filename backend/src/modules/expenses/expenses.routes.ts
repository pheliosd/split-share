import { FastifyInstance } from 'fastify';
import { ExpensesController } from './expenses.controller';

export async function expensesRoutes(fastify: FastifyInstance) {
    const controller = new ExpensesController();

    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    // Create expense
    fastify.post('/', {
        schema: {
            description: 'Create a new expense',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['groupId', 'description', 'amount', 'payerId', 'splitType', 'splits'],
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                    description: { type: 'string' },
                    amount: { type: 'number', minimum: 0.01 },
                    currency: { type: 'string', default: 'USD' },
                    date: { type: 'string', format: 'date-time' },
                    category: { type: 'string' },
                    notes: { type: 'string' },
                    payerId: { type: 'string', format: 'uuid' },
                    splitType: { type: 'string', enum: ['equal', 'exact', 'percentage', 'shares'] },
                    splits: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['userId'],
                            properties: {
                                userId: { type: 'string', format: 'uuid' },
                                amount: { type: 'number' },
                                percentage: { type: 'number' },
                                shares: { type: 'integer' },
                            },
                        },
                    },
                    isDraft: { type: 'boolean', default: false },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        expense: { type: 'object' },
                    },
                },
            },
        },
    }, controller.createExpense.bind(controller));

    // Get expenses with filters
    fastify.get('/', {
        schema: {
            description: 'Get expenses with filters and pagination',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    groupId: { type: 'string', format: 'uuid' },
                    category: { type: 'string' },
                    payerId: { type: 'string', format: 'uuid' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    minAmount: { type: 'number' },
                    maxAmount: { type: 'number' },
                    search: { type: 'string' },
                    limit: { type: 'integer', default: 50 },
                    offset: { type: 'integer', default: 0 },
                    sortBy: { type: 'string', enum: ['date', 'amount', 'createdAt'], default: 'date' },
                    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        expenses: { type: 'array', items: { type: 'object' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                        hasMore: { type: 'boolean' },
                    },
                },
            },
        },
    }, controller.getExpenses.bind(controller));

    // Get expense by ID
    fastify.get('/:expenseId', {
        schema: {
            description: 'Get expense details',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    expenseId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        expense: { type: 'object' },
                    },
                },
            },
        },
    }, controller.getExpense.bind(controller));

    // Update expense
    fastify.patch('/:expenseId', {
        schema: {
            description: 'Update expense',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    expenseId: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    description: { type: 'string' },
                    amount: { type: 'number', minimum: 0.01 },
                    date: { type: 'string', format: 'date-time' },
                    category: { type: 'string' },
                    notes: { type: 'string' },
                    payerId: { type: 'string', format: 'uuid' },
                    splitType: { type: 'string', enum: ['equal', 'exact', 'percentage', 'shares'] },
                    splits: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['userId'],
                            properties: {
                                userId: { type: 'string', format: 'uuid' },
                                amount: { type: 'number' },
                                percentage: { type: 'number' },
                                shares: { type: 'integer' },
                            },
                        },
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        expense: { type: 'object' },
                    },
                },
            },
        },
    }, controller.updateExpense.bind(controller));

    // Delete expense
    fastify.delete('/:expenseId', {
        schema: {
            description: 'Delete expense',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    expenseId: { type: 'string', format: 'uuid' },
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
    }, controller.deleteExpense.bind(controller));

    // Add comment
    fastify.post('/:expenseId/comments', {
        schema: {
            description: 'Add comment to expense',
            tags: ['expenses'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    expenseId: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                required: ['comment'],
                properties: {
                    comment: { type: 'string' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        comment: { type: 'object' },
                    },
                },
            },
        },
    }, controller.addComment.bind(controller));
}
