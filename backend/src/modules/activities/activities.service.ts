import { activityLogsCollection } from '../../config/mongodb';
import type { GetActivitiesQuery } from './activities.schemas';

export class ActivitiesService {
    async getActivities(userId: string, query: GetActivitiesQuery) {
        const {
            groupId,
            userId: filterUserId,
            type,
            startDate,
            endDate,
            limit = 20,
            offset = 0,
        } = query;

        // Build filter
        const filter: any = {};

        // User must be part of the activity (either as actor or in a group they're in)
        // For now, we'll filter by userId or groupId
        if (groupId) {
            filter['metadata.groupId'] = groupId;
        }

        if (filterUserId) {
            filter.userId = filterUserId;
        }

        if (type) {
            filter.action = new RegExp(`^${type}`);
        }

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.timestamp.$lte = new Date(endDate);
            }
        }

        // Get total count
        const total = await activityLogsCollection.countDocuments(filter);

        // Get activities with pagination
        const activities = await activityLogsCollection
            .find(filter)
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        return {
            activities: activities.map((activity) => ({
                id: activity._id.toString(),
                userId: activity.userId,
                action: activity.action,
                metadata: activity.metadata,
                timestamp: activity.timestamp,
                ipAddress: activity.ipAddress,
            })),
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }

    async getActivity(activityId: string) {
        const activity = await activityLogsCollection.findOne({
            _id: activityId as any,
        });

        if (!activity) {
            throw new Error('Activity not found');
        }

        return {
            id: activity._id.toString(),
            userId: activity.userId,
            action: activity.action,
            metadata: activity.metadata,
            timestamp: activity.timestamp,
            ipAddress: activity.ipAddress,
        };
    }

    async getGroupActivities(groupId: string, limit = 20, offset = 0) {
        const filter = {
            'metadata.groupId': groupId,
        };

        const total = await activityLogsCollection.countDocuments(filter);

        const activities = await activityLogsCollection
            .find(filter)
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        return {
            activities: activities.map((activity) => ({
                id: activity._id.toString(),
                userId: activity.userId,
                action: activity.action,
                metadata: activity.metadata,
                timestamp: activity.timestamp,
            })),
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }

    async getUserActivities(userId: string, limit = 20, offset = 0) {
        const filter = {
            userId,
        };

        const total = await activityLogsCollection.countDocuments(filter);

        const activities = await activityLogsCollection
            .find(filter)
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        return {
            activities: activities.map((activity) => ({
                id: activity._id.toString(),
                userId: activity.userId,
                action: activity.action,
                metadata: activity.metadata,
                timestamp: activity.timestamp,
            })),
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }
}
