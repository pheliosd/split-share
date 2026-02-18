import type { FastifyInstance } from 'fastify';
import { AnalyticsController } from './analytics.controller';

const controller = new AnalyticsController();

export async function analyticsRoutes(fastify: FastifyInstance) {
    const auth = { onRequest: [fastify.authenticate] };

    // Spending by category (pie chart data)
    fastify.get('/spending/category', auth, controller.getSpendingByCategory);

    // Spending over time (line/bar chart data)
    fastify.get('/spending/time', auth, controller.getSpendingOverTime);

    // User summary stats
    fastify.get('/user/summary', auth, controller.getUserSummary);

    // Group summary stats
    fastify.get('/group/:groupId', auth, controller.getGroupSummary);

    // Top expenses
    fastify.get('/top-expenses', auth, controller.getTopExpenses);
}
