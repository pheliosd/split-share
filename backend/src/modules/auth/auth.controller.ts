import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import {
    registerSchema,
    loginSchema,
    oauthLoginSchema,
    refreshTokenSchema,
    changePasswordSchema,
} from './auth.schemas';
import { User } from '@prisma/client';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Register new user
     */
    async register(request: FastifyRequest, reply: FastifyReply) {
        try {
            const dto = registerSchema.parse(request.body);

            const user = await this.authService.register(dto);

            // Generate tokens
            const accessToken = request.server.jwt.sign(
                { userId: user.id, email: user.email },
                { expiresIn: '15m' }
            );

            const refreshToken = request.server.jwt.sign(
                { userId: user.id, type: 'refresh' },
                { expiresIn: '7d' }
            );

            // Remove sensitive data
            const { passwordHash, ...userWithoutPassword } = user;

            return reply.status(201).send({
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Registration failed',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Login user
     */
    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const dto = loginSchema.parse(request.body);

            const user = await this.authService.login(dto);

            // Generate tokens
            const accessToken = request.server.jwt.sign(
                { userId: user.id, email: user.email },
                { expiresIn: '15m' }
            );

            const refreshToken = request.server.jwt.sign(
                { userId: user.id, type: 'refresh' },
                { expiresIn: '7d' }
            );

            // Remove sensitive data
            const { passwordHash, ...userWithoutPassword } = user;

            return reply.send({
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            return reply.status(401).send({
                error: {
                    message: error.message || 'Invalid credentials',
                    statusCode: 401,
                },
            });
        }
    }

    /**
     * OAuth login (Google/Apple)
     */
    async oauthLogin(request: FastifyRequest, reply: FastifyReply) {
        try {
            const dto = oauthLoginSchema.parse(request.body);

            const user = await this.authService.oauthLogin(dto);

            // Generate tokens
            const accessToken = request.server.jwt.sign(
                { userId: user.id, email: user.email },
                { expiresIn: '15m' }
            );

            const refreshToken = request.server.jwt.sign(
                { userId: user.id, type: 'refresh' },
                { expiresIn: '7d' }
            );

            // Remove sensitive data
            const { passwordHash, ...userWithoutPassword } = user;

            return reply.send({
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'OAuth login failed',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Refresh access token
     */
    async refresh(request: FastifyRequest, reply: FastifyReply) {
        try {
            const dto = refreshTokenSchema.parse(request.body);

            // Verify refresh token
            const decoded = request.server.jwt.verify<{ userId: string; type: string }>(
                dto.refreshToken
            );

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            // Find user
            const user = await this.authService.findById(decoded.userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Generate new access token
            const accessToken = request.server.jwt.sign(
                { userId: user.id, email: user.email },
                { expiresIn: '15m' }
            );

            // Generate new refresh token
            const refreshToken = request.server.jwt.sign(
                { userId: user.id, type: 'refresh' },
                { expiresIn: '7d' }
            );

            return reply.send({
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            return reply.status(401).send({
                error: {
                    message: 'Invalid or expired refresh token',
                    statusCode: 401,
                },
            });
        }
    }

    /**
     * Logout (client-side token removal)
     */
    async logout(request: FastifyRequest, reply: FastifyReply) {
        // In a stateless JWT system, logout is mainly client-side
        // Optionally, add token to blacklist in Redis

        return reply.send({
            message: 'Logged out successfully',
        });
    }

    /**
     * Get current user
     */
    async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();

            const user = await this.authService.findById(decoded.userId);

            if (!user) {
                return reply.status(404).send({
                    error: {
                        message: 'User not found',
                        statusCode: 404,
                    },
                });
            }

            // Remove sensitive data
            const { passwordHash, ...userWithoutPassword } = user;

            return reply.send({ user: userWithoutPassword });
        } catch (error: any) {
            return reply.status(401).send({
                error: {
                    message: 'Unauthorized',
                    statusCode: 401,
                },
            });
        }
    }

    /**
     * Change password
     */
    async changePassword(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = changePasswordSchema.parse(request.body);

            await this.authService.changePassword(
                decoded.userId,
                dto.currentPassword,
                dto.newPassword
            );

            return reply.send({
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to change password',
                    statusCode: 400,
                },
            });
        }
    }
}
