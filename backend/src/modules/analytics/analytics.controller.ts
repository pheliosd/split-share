import type { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from './analytics.service';

const analyticsService = new AnalyticsService();

interface AnalyticsQuery {
    groupId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'month';
    limit?: number;
}

export class AnalyticsController {
    async getSpendingByCategory(
        request: FastifyRequest<{ Querystring: AnalyticsQuery }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const { groupId, startDate, endDate } = request.query;
            const data = await analyticsService.getSpendingByCategory(
                userId, groupId, startDate, endDate
            );
            return reply.code(200).send({ data });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async getSpendingOverTime(
        request: FastifyRequest<{ Querystring: AnalyticsQuery }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const { groupId, startDate, endDate, groupBy } = request.query;
            const data = await analyticsService.getSpendingOverTime(
                userId, groupId, startDate, endDate, groupBy
            );
            return reply.code(200).send({ data });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async getUserSummary(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const data = await analyticsService.getUserSummary(userId);
            return reply.code(200).send({ data });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async getGroupSummary(
        request: FastifyRequest<{ Params: { groupId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { groupId } = request.params;
            const data = await analyticsService.getGroupSummary(groupId);
            return reply.code(200).send({ data });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async getTopExpenses(
        request: FastifyRequest<{ Querystring: AnalyticsQuery }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const { groupId, limit } = request.query;
            const data = await analyticsService.getTopExpenses(userId, groupId, limit);
            return reply.code(200).send({ data });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }
}
