import type { FastifyInstance } from 'fastify';
import { CurrencyController } from './currency.controller';

const controller = new CurrencyController();

export async function currencyRoutes(fastify: FastifyInstance) {
    // Public endpoint - no auth needed for currency list
    fastify.get('/supported', controller.getSupportedCurrencies);

    // Authenticated endpoints
    fastify.get('/rates', { onRequest: [fastify.authenticate] }, controller.getRates);
    fastify.get('/convert', { onRequest: [fastify.authenticate] }, controller.convertAmount);
}
