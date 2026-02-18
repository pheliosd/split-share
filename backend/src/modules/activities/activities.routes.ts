import type { FastifyInstance } from 'fastify';
import { ActivitiesController } from './activities.controller';
import { getActivitiesSchema } from './activities.schemas';

const controller = new ActivitiesController();

export async function activitiesRoutes(fastify: FastifyInstance) {
    // Get all activities with filters
    fastify.get(
        '/',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Get activities with optional filters',
                tags: ['activities'],
                querystring: getActivitiesSchema.shape.querystring,
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            activities: { type: 'array' },
                            total: { type: 'number' },
                            limit: { type: 'number' },
                            offset: { type: 'number' },
                            hasMore: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        controller.getActivities
    );

    // Get single activity
    fastify.get(
        '/:activityId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Get activity by ID',
                tags: ['activities'],
                params: {
                    type: 'object',
                    properties: {
                        activityId: { type: 'string' },
                    },
                    required: ['activityId'],
                },
            },
        },
        controller.getActivity
    );

    // Get group activities
    fastify.get(
        '/group/:groupId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Get activities for a specific group',
                tags: ['activities'],
                params: {
                    type: 'object',
                    properties: {
                        groupId: { type: 'string', format: 'uuid' },
                    },
                    required: ['groupId'],
                },
                querystring: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
                        offset: { type: 'number', minimum: 0, default: 0 },
                    },
                },
            },
        },
        controller.getGroupActivities
    );
}
