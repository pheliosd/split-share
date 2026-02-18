import type { FastifyRequest, FastifyReply } from 'fastify';
import { ExportService } from './export.service';

const exportService = new ExportService();

interface ExportQuery {
    startDate?: string;
    endDate?: string;
    groupId?: string;
}

export class ExportController {
    async exportGroupCSV(
        request: FastifyRequest<{
            Params: { groupId: string };
            Querystring: ExportQuery;
        }>,
        reply: FastifyReply
    ) {
        try {
            const { groupId } = request.params;
            const { startDate, endDate } = request.query;
            const csv = await exportService.exportGroupExpensesCSV(groupId, startDate, endDate);

            return reply
                .code(200)
                .header('Content-Type', 'text/csv')
                .header('Content-Disposition', `attachment; filename="group-${groupId}-expenses.csv"`)
                .send(csv);
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async exportUserCSV(
        request: FastifyRequest<{ Querystring: ExportQuery }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const { groupId, startDate, endDate } = request.query;
            const csv = await exportService.exportUserExpensesCSV(userId, groupId, startDate, endDate);

            return reply
                .code(200)
                .header('Content-Type', 'text/csv')
                .header('Content-Disposition', 'attachment; filename="my-expenses.csv"')
                .send(csv);
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }
}
