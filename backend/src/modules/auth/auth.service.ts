import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../../server';
import { RegisterDto, LoginDto, OAuthLoginDto } from './auth.schemas';

const SALT_ROUNDS = 12;

export class AuthService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    /**
     * Register a new user with email/phone and password
     */
    async register(dto: RegisterDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { phone: dto.phone },
                ],
            },
        });

        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                phone: dto.phone,
                passwordHash,
                name: dto.name,
                defaultCurrency: dto.defaultCurrency || 'USD',
                isVerified: false,
                isAnonymous: false,
            },
        });

        // TODO: Send verification email

        return user;
    }

    /**
     * Login with email and password
     */
    async login(dto: LoginDto): Promise<User> {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return user;
    }

    /**
     * OAuth login (Google/Apple)
     */
    async oauthLogin(dto: OAuthLoginDto): Promise<User> {
        // TODO: Verify idToken with provider
        // For now, we'll extract the oauthId from the token (simplified)
        const oauthId = dto.idToken; // In production, verify and extract from JWT

        // Find existing user with this OAuth account
        let user = await this.prisma.user.findFirst({
            where: {
                oauthProvider: dto.provider,
                oauthId: oauthId,
            },
        });

        if (!user) {
            // Create new user
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    name: dto.name || 'User',
                    oauthProvider: dto.provider,
                    oauthId: oauthId,
                    isVerified: true, // OAuth users are pre-verified
                    isAnonymous: false,
                    defaultCurrency: 'USD',
                },
            });
        } else {
            // Update last login
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
        }

        return user;
    }

    /**
     * Create anonymous user
     */
    async createAnonymousUser(name?: string): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                name: name || `Guest_${Date.now()}`,
                isAnonymous: true,
                isVerified: false,
                defaultCurrency: 'USD',
            },
        });

        return user;
    }

    /**
     * Claim anonymous account by converting to registered user
     */
    async claimAnonymousAccount(
        anonymousUserId: string,
        dto: RegisterDto
    ): Promise<User> {
        // Find anonymous user
        const anonymousUser = await this.prisma.user.findUnique({
            where: { id: anonymousUserId },
        });

        if (!anonymousUser || !anonymousUser.isAnonymous) {
            throw new Error('Invalid anonymous user');
        }

        // Check if email/phone already taken
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { phone: dto.phone },
                ],
            },
        });

        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

        // Update anonymous user to registered user
        const user = await this.prisma.user.update({
            where: { id: anonymousUserId },
            data: {
                email: dto.email,
                phone: dto.phone,
                passwordHash,
                name: dto.name,
                defaultCurrency: dto.defaultCurrency || anonymousUser.defaultCurrency,
                isAnonymous: false,
                isVerified: false,
            },
        });

        return user;
    }

    /**
     * Find user by ID
     */
    async findById(userId: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id: userId },
        });
    }

    /**
     * Verify password for user
     */
    async verifyPassword(user: User, password: string): Promise<boolean> {
        if (!user.passwordHash) {
            return false;
        }

        return await bcrypt.compare(password, user.passwordHash);
    }

    /**
     * Change user password
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValid = await this.verifyPassword(user, currentPassword);

        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }
}
