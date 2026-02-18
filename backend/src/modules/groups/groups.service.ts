import { PrismaClient, Group, GroupMember } from '@prisma/client';
import { prisma } from '../../server';
import { CreateGroupDto, UpdateGroupDto } from './groups.schemas';
import { simplifyDebts } from '../../common/utils/debt-simplification';

export class GroupsService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    /**
     * Create a new group
     */
    async createGroup(userId: string, dto: CreateGroupDto): Promise<Group> {
        // Validate all members exist
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: dto.memberIds },
            },
        });

        if (users.length !== dto.memberIds.length) {
            throw new Error('Some users not found');
        }

        // Create group
        const group = await this.prisma.group.create({
            data: {
                name: dto.name,
                description: dto.description,
                type: dto.type,
                currency: dto.currency,
                createdBy: userId,
                parentGroupId: dto.parentGroupId,
                members: {
                    create: [
                        // Creator is admin
                        {
                            userId,
                            role: 'admin',
                        },
                        // Other members
                        ...dto.memberIds
                            .filter(id => id !== userId)
                            .map(id => ({
                                userId: id,
                                role: 'member' as const,
                            })),
                    ],
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return group;
    }

    /**
     * Get user's groups
     */
    async getUserGroups(userId: string): Promise<Group[]> {
        const groups = await this.prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
                isArchived: false,
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                _count: {
                    select: {
                        expenses: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return groups;
    }

    /**
     * Get group by ID
     */
    async getGroupById(groupId: string, userId: string): Promise<Group | null> {
        const group = await this.prisma.group.findFirst({
            where: {
                id: groupId,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                _count: {
                    select: {
                        expenses: true,
                    },
                },
            },
        });

        return group;
    }

    /**
     * Update group
     */
    async updateGroup(
        groupId: string,
        userId: string,
        dto: UpdateGroupDto
    ): Promise<Group> {
        // Check if user is admin
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
                role: 'admin',
            },
        });

        if (!member) {
            throw new Error('Only group admins can update group settings');
        }

        return await this.prisma.group.update({
            where: { id: groupId },
            data: dto,
        });
    }

    /**
     * Add members to group
     */
    async addMembers(
        groupId: string,
        userId: string,
        userIds: string[]
    ): Promise<GroupMember[]> {
        // Check if user is admin
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
                role: 'admin',
            },
        });

        if (!member) {
            throw new Error('Only group admins can add members');
        }

        // Create memberships
        const members = await Promise.all(
            userIds.map(async (uid) => {
                return await this.prisma.groupMember.upsert({
                    where: {
                        groupId_userId: {
                            groupId,
                            userId: uid,
                        },
                    },
                    create: {
                        groupId,
                        userId: uid,
                        role: 'member',
                    },
                    update: {},
                    include: {
                        user: true,
                    },
                });
            })
        );

        return members;
    }

    /**
     * Remove member from group
     */
    async removeMember(
        groupId: string,
        requestUserId: string,
        targetUserId: string
    ): Promise<void> {
        // Check if requester is admin or removing themselves
        const requesterMember = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: requestUserId,
            },
        });

        if (!requesterMember) {
            throw new Error('You are not a member of this group');
        }

        if (requesterMember.role !== 'admin' && requestUserId !== targetUserId) {
            throw new Error('Only admins can remove other members');
        }

        // Don't allow removing last admin
        if (requesterMember.role === 'admin' && requestUserId === targetUserId) {
            const adminCount = await this.prisma.groupMember.count({
                where: {
                    groupId,
                    role: 'admin',
                },
            });

            if (adminCount === 1) {
                throw new Error('Cannot remove the last admin from group');
            }
        }

        await this.prisma.groupMember.delete({
            where: {
                groupId_userId: {
                    groupId,
                    userId: targetUserId,
                },
            },
        });
    }

    /**
     * Archive group
     */
    async archiveGroup(groupId: string, userId: string): Promise<Group> {
        // Check if user is admin
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
                role: 'admin',
            },
        });

        if (!member) {
            throw new Error('Only group admins can archive groups');
        }

        return await this.prisma.group.update({
            where: { id: groupId },
            data: { isArchived: true },
        });
    }

    /**
     * Get group balances
     */
    async getGroupBalances(groupId: string, userId: string) {
        // Check if user is member
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
            },
        });

        if (!member) {
            throw new Error('You are not a member of this group');
        }

        // Get pre-computed balances
        const balances = await this.prisma.balance.findMany({
            where: { groupId },
            include: {
                user: true,
            },
        });

        // Get group settings
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            select: { simplifyDebts: true },
        });

        // Format balances for response
        const balanceMap = balances.map(b => ({
            userId: b.userId,
            userName: b.user.name,
            avatarUrl: b.user.avatarUrl,
            balance: b.balance,
            currency: b.currency,
        }));

        // Calculate simplified debts if enabled
        let simplifiedDebts = null;
        if (group?.simplifyDebts) {
            const balanceData = balances.map(b => ({
                userId: b.userId,
                amount: Number(b.balance),
            }));

            simplifiedDebts = simplifyDebts(balanceData).map(debt => ({
                ...debt,
                fromUser: balances.find(b => b.userId === debt.from)?.user,
                toUser: balances.find(b => b.userId === debt.to)?.user,
            }));
        }

        return {
            balances: balanceMap,
            simplifiedDebts,
        };
    }
}
