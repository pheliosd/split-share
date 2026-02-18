import { FastifyRequest, FastifyReply } from 'fastify';
import { GroupsService } from './groups.service';
import {
    createGroupSchema,
    updateGroupSchema,
    addMembersSchema,
} from './groups.schemas';

export class GroupsController {
    private groupsService: GroupsService;

    constructor() {
        this.groupsService = new GroupsService();
    }

    /**
     * Create new group
     */
    async createGroup(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = createGroupSchema.parse(request.body);

            const group = await this.groupsService.createGroup(decoded.userId, dto);

            return reply.status(201).send({ group });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to create group',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get user's groups
     */
    async getGroups(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();

            const groups = await this.groupsService.getUserGroups(decoded.userId);

            return reply.send({ groups });
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    message: error.message || 'Failed to get groups',
                    statusCode: 500,
                },
            });
        }
    }

    /**
     * Get group by ID
     */
    async getGroup(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId } = request.params as { groupId: string };

            const group = await this.groupsService.getGroupById(groupId, decoded.userId);

            if (!group) {
                return reply.status(404).send({
                    error: {
                        message: 'Group not found',
                        statusCode: 404,
                    },
                });
            }

            return reply.send({ group });
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    message: error.message || 'Failed to get group',
                    statusCode: 500,
                },
            });
        }
    }

    /**
     * Update group
     */
    async updateGroup(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId } = request.params as { groupId: string };
            const dto = updateGroupSchema.parse(request.body);

            const group = await this.groupsService.updateGroup(
                groupId,
                decoded.userId,
                dto
            );

            return reply.send({ group });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to update group',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Add members to group
     */
    async addMembers(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId } = request.params as { groupId: string };
            const dto = addMembersSchema.parse(request.body);

            const members = await this.groupsService.addMembers(
                groupId,
                decoded.userId,
                dto.userIds
            );

            return reply.status(201).send({ members });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to add members',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Remove member from group
     */
    async removeMember(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId, userId } = request.params as { groupId: string; userId: string };

            await this.groupsService.removeMember(groupId, decoded.userId, userId);

            return reply.send({ message: 'Member removed successfully' });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to remove member',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Archive group
     */
    async archiveGroup(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId } = request.params as { groupId: string };

            const group = await this.groupsService.archiveGroup(groupId, decoded.userId);

            return reply.send({ group });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to archive group',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get group balances
     */
    async getBalances(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { groupId } = request.params as { groupId: string };

            const balances = await this.groupsService.getGroupBalances(
                groupId,
                decoded.userId
            );

            return reply.send(balances);
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    message: error.message || 'Failed to get balances',
                    statusCode: 500,
                },
            });
        }
    }
}
