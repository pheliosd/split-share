import { Db, MongoClient } from 'mongodb';

// MongoDB Schema Definitions and Indexes

export interface ActivityLog {
    _id?: any;
    userId: string; // UUID
    groupId: string; // UUID
    entityType: 'expense' | 'settlement' | 'group' | 'member';
    entityId: string; // UUID
    action: string; // 'created', 'updated', 'deleted', 'added', 'removed'
    description: string;
    metadata: Record<string, any>;
    timestamp: Date;
    tags: string[];
    category?: string;
}

export interface OcrMetadata {
    _id?: any;
    expenseId: string; // UUID
    receiptUrl: string;
    ocrProvider: 'google' | 'aws' | 'tesseract';
    ocrProcessedAt: Date;
    extractedData: {
        merchantName?: string;
        total?: number;
        currency?: string;
        date?: Date;
        items?: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        rawText: string;
        confidence: number;
    };
    manualCorrections?: {
        correctedBy: string; // user UUID
        correctedAt: Date;
        corrections: Record<string, any>;
    };
}

export interface AnalyticsCache {
    _id?: any;
    groupId: string;
    userId?: string; // NULL for group-wide analytics
    period: 'monthly' | 'quarterly' | 'yearly';
    periodStart: Date;
    periodEnd: Date;
    data: {
        totalExpenses: number;
        categoryBreakdown: Record<string, number>;
        topPayers: Array<{ userId: string; amount: number }>;
        topOwers: Array<{ userId: string; amount: number }>;
        averageExpense: number;
        patterns?: Record<string, any>;
    };
    computedAt: Date;
    expiresAt: Date;
}

/**
 * Initialize MongoDB collections and create indexes
 */
export async function initializeMongoDb(mongoUrl: string): Promise<Db> {
    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db('splitwise');

    // Create collections
    const activityLogsCollection = db.collection<ActivityLog>('activity_logs');
    const ocrMetadataCollection = db.collection<OcrMetadata>('ocr_metadata');
    const analyticsCacheCollection = db.collection<AnalyticsCache>('analytics_cache');

    // Create indexes for activity_logs
    await activityLogsCollection.createIndexes([
        { key: { groupId: 1, timestamp: -1 } },
        { key: { userId: 1, timestamp: -1 } },
        { key: { entityType: 1, entityId: 1 } },
        { key: { tags: 1 } },
    ]);

    // Create indexes for ocr_metadata
    await ocrMetadataCollection.createIndexes([
        { key: { expenseId: 1 }, unique: true },
    ]);

    // Create indexes for analytics_cache
    await analyticsCacheCollection.createIndexes([
        { key: { groupId: 1, period: 1, periodStart: 1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
    ]);

    console.log('MongoDB collections and indexes created successfully');

    return db;
}
