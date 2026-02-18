import dotenv from 'dotenv';

dotenv.config();

interface Config {
    // Server
    nodeEnv: string;
    port: number;
    host: string;

    // Databases
    databaseUrl: string;
    mongoUrl: string;
    redisUrl: string;

    // JWT
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiry: string;
    jwtRefreshExpiry: string;

    // OAuth
    googleClientId: string;
    googleClientSecret: string;
    appleClientId: string;
    appleClientSecret: string;

    // S3/MinIO
    s3Endpoint: string;
    s3AccessKey: string;
    s3SecretKey: string;
    s3Bucket: string;
    s3Region: string;

    // Exchange Rate API
    exchangeRateApiKey: string;
    exchangeRateApiUrl: string;

    // Email
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    emailFrom: string;

    // Push Notifications
    fcmServerKey: string;

    // OCR
    ocrProvider: 'google' | 'aws' | 'tesseract';
    googleVisionApiKey: string;
    awsTextractAccessKey: string;
    awsTextractSecretKey: string;

    // Rate Limiting
    rateLimitMax: number;
    rateLimitWindow: string;

    // CORS
    corsOrigin: string[];
}

const config: Config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',

    // Databases
    databaseUrl: process.env.DATABASE_URL || '',
    mongoUrl: process.env.MONGO_URL || '',
    redisUrl: process.env.REDIS_URL || '',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

    // OAuth
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    appleClientId: process.env.APPLE_CLIENT_ID || '',
    appleClientSecret: process.env.APPLE_CLIENT_SECRET || '',

    // S3/MinIO
    s3Endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    s3AccessKey: process.env.S3_ACCESS_KEY || '',
    s3SecretKey: process.env.S3_SECRET_KEY || '',
    s3Bucket: process.env.S3_BUCKET || 'splitwise-receipts',
    s3Region: process.env.S3_REGION || 'us-east-1',

    // Exchange Rate API
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || '',
    exchangeRateApiUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest',

    // Email
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || 'noreply@splitwise.com',

    // Push Notifications
    fcmServerKey: process.env.FCM_SERVER_KEY || '',

    // OCR
    ocrProvider: (process.env.OCR_PROVIDER as any) || 'tesseract',
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY || '',
    awsTextractAccessKey: process.env.AWS_TEXTRACT_ACCESS_KEY || '',
    awsTextractSecretKey: process.env.AWS_TEXTRACT_SECRET_KEY || '',

    // Rate Limiting
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '15m',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8081'],
};

// Validate required configuration
const requiredEnvVars = ['DATABASE_URL', 'MONGO_URL', 'REDIS_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    const key = envVar.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!(config as any)[key]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export default config;
