import type { FastifyRequest, FastifyReply } from 'fastify';
import { ActivitiesService } from './activities.service';
import type { GetActivitiesQuery } from './activities.schemas';

const activitiesService = new ActivitiesService();

export class ActivitiesController {
    async getActivities(
        request: FastifyRequest<{ Querystring: GetActivitiesQuery }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user!.userId;
            const result = await activitiesService.getActivities(userId, request.query);
            return reply.code(200).send(result);
        } catch (error: any) {
            return reply.code(500).send({
                error: { message: error.message || 'Failed to fetch activities' },
            });
        }
    }

    async getActivity(
        request: FastifyRequest<{ Params: { activityId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { activityId } = request.params;
            const activity = await activitiesService.getActivity(activityId);
            return reply.code(200).send({ activity });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Activity not found' },
            });
        }
    }

    async getGroupActivities(
        request: FastifyRequest<{
            Params: { groupId: string };
            Querystring: { limit?: number; offset?: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { groupId } = request.params;
            const { limit, offset } = request.query;
            const result = await activitiesService.getGroupActivities(
                groupId,
                limit,
                offset
            );
            return reply.code(200).send(result);
        } catch (error: any) {
            return reply.code(500).send({
                error: { message: error.message || 'Failed to fetch group activities' },
            });
        }
    }
}
