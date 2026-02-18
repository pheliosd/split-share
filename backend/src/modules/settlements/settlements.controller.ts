import { FastifyRequest, FastifyReply } from 'fastify';
import { SettlementsService } from './settlements.service';
import {
    createSettlementSchema,
    settlementFiltersSchema,
} from './settlements.schemas';

export class SettlementsController {
    private settlementsService: SettlementsService;

    constructor() {
        this.settlementsService = new SettlementsService();
    }

    /**
     * Create new settlement
     */
    async createSettlement(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = createSettlementSchema.parse(request.body);

            const settlement = await this.settlementsService.createSettlement(
                decoded.userId,
                dto
            );

            return reply.status(201).send({ settlement });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to create settlement',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get settlements with filters
     */
    async getSettlements(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const filters = settlementFiltersSchema.parse(request.query);

            const result = await this.settlementsService.getSettlements(
                decoded.userId,
                filters
            );

            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to get settlements',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get settlement by ID
     */
    async getSettlement(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { settlementId } = request.params as { settlementId: string };

            const settlement = await this.settlementsService.getSettlementById(
                settlementId,
                decoded.userId
            );

            return reply.send({ settlement });
        } catch (error: any) {
            return reply.status(404).send({
                error: {
                    message: error.message || 'Settlement not found',
                    statusCode: 404,
                },
            });
        }
    }

    /**
     * Delete settlement
     */
    async deleteSettlement(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { settlementId } = request.params as { settlementId: string };

            await this.settlementsService.deleteSettlement(settlementId, decoded.userId);

            return reply.send({ message: 'Settlement deleted successfully' });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to delete settlement',
                    statusCode: 400,
                },
            });
        }
    }
}
