import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../../server';
import { UpdateProfileDto } from './users.schemas';

export class UsersService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    /**
     * Get user by ID
     */
    async findById(userId: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id: userId },
        });
    }

    /**
     * Get user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
        return await this.prisma.user.update({
            where: { id: userId },
            data: dto,
        });
    }

    /**
     * Search users by name or email
     */
    async searchUsers(query: string, limit: number = 20): Promise<User[]> {
        return await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                isAnonymous: false, // Don't show anonymous users in search
            },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                defaultCurrency: true,
                createdAt: true,
                updatedAt: true,
                // Exclude sensitive fields
                passwordHash: false,
                phone: false,
            },
        }) as User[];
    }

    /**
     * Add friend request
     */
    async addFriend(userId: string, friendId: string): Promise<void> {
        // Check if friendship already exists
        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        if (existing) {
            throw new Error('Friendship already exists or pending');
        }

        // Create friend request
        await this.prisma.friendship.create({
            data: {
                userId,
                friendId,
                status: 'pending',
            },
        });
    }

    /**
     * Accept friend request
     */
    async acceptFriendRequest(friendshipId: string, userId: string): Promise<void> {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship || friendship.friendId !== userId) {
            throw new Error('Friend request not found or unauthorized');
        }

        await this.prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'accepted' },
        });
    }

    /**
     * Get user's friends
     */
    async getFriends(userId: string): Promise<User[]> {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { userId, status: 'accepted' },
                    { friendId: userId, status: 'accepted' },
                ],
            },
            include: {
                user: true,
                friend: true,
            },
        });

        // Extract friend user objects
        const friends = friendships.map(f =>
            f.userId === userId ? f.friend : f.user
        );

        return friends;
    }

    /**
     * Remove friend
     */
    async removeFriend(userId: string, friendId: string): Promise<void> {
        await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }
}
