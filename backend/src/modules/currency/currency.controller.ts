import type { FastifyRequest, FastifyReply } from 'fastify';
import { CurrencyService } from './currency.service';

const currencyService = new CurrencyService();

export class CurrencyController {
    async getSupportedCurrencies(_request: FastifyRequest, reply: FastifyReply) {
        return reply.code(200).send({
            currencies: currencyService.getSupportedCurrencies(),
        });
    }

    async getRates(
        request: FastifyRequest<{ Querystring: { base?: string } }>,
        reply: FastifyReply
    ) {
        try {
            const base = request.query.base || 'USD';
            const rates = await currencyService.getRates(base);
            return reply.code(200).send({ base, rates });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    }

    async convertAmount(
        request: FastifyRequest<{
            Querystring: { amount: string; from: string; to: string };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { amount, from, to } = request.query;
            const converted = await currencyService.convertAmount(
                parseFloat(amount),
                from,
                to
            );
            return reply.code(200).send({
                original: { amount: parseFloat(amount), currency: from },
                converted: { amount: converted, currency: to },
            });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    }
}
