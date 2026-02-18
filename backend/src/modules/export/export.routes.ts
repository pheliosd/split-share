import type { FastifyInstance } from 'fastify';
import { ExportController } from './export.controller';

const controller = new ExportController();

export async function exportRoutes(fastify: FastifyInstance) {
    const auth = { onRequest: [fastify.authenticate] };

    // Export group expenses as CSV
    fastify.get('/group/:groupId/csv', auth, controller.exportGroupCSV);

    // Export user's expenses as CSV
    fastify.get('/my-expenses/csv', auth, controller.exportUserCSV);
}
