import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import { updateProfileSchema, searchUsersSchema, addFriendSchema } from './users.schemas';

export class UsersController {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    /**
     * Get current user profile
     */
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();

            const user = await this.usersService.findById(decoded.userId);

            if (!user) {
                return reply.status(404).send({
                    error: {
                        message: 'User not found',
                        statusCode: 404,
                    },
                });
            }

            const { passwordHash, ...userWithoutPassword } = user;

            return reply.send({ user: userWithoutPassword });
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    message: error.message || 'Failed to get profile',
                    statusCode: 500,
                },
            });
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = updateProfileSchema.parse(request.body);

            const user = await this.usersService.updateProfile(decoded.userId, dto);

            const { passwordHash, ...userWithoutPassword } = user;

            return reply.send({ user: userWithoutPassword });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to update profile',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Search users
     */
    async searchUsers(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { q, limit } = searchUsersSchema.parse(request.query);

            const users = await this.usersService.searchUsers(q, limit);

            return reply.send({ users });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to search users',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Add friend
     */
    async addFriend(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = addFriendSchema.parse(request.body);

            if (decoded.userId === dto.friendId) {
                return reply.status(400).send({
                    error: {
                        message: 'Cannot add yourself as a friend',
                        statusCode: 400,
                    },
                });
            }

            await this.usersService.addFriend(decoded.userId, dto.friendId);

            return reply.status(201).send({
                message: 'Friend request sent',
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to add friend',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Accept friend request
     */
    async acceptFriend(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { friendshipId } = request.params as { friendshipId: string };

            await this.usersService.acceptFriendRequest(friendshipId, decoded.userId);

            return reply.send({
                message: 'Friend request accepted',
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to accept friend request',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get friends list
     */
    async getFriends(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();

            const friends = await this.usersService.getFriends(decoded.userId);

            return reply.send({ friends });
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    message: error.message || 'Failed to get friends',
                    statusCode: 500,
                },
            });
        }
    }

    /**
     * Remove friend
     */
    async removeFriend(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { userId: friendId } = request.params as { userId: string };

            await this.usersService.removeFriend(decoded.userId, friendId);

            return reply.send({
                message: 'Friend removed',
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to remove friend',
                    statusCode: 400,
                },
            });
        }
    }
}
