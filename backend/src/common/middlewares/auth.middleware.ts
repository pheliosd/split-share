import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user ID to request
 */
export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        await request.jwtVerify();
    } catch (error) {
        reply.status(401).send({
            error: {
                message: 'Unauthorized - Invalid or missing token',
                statusCode: 401,
            },
        });
    }
}

// Extend Fastify instance to include authenticate method
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: typeof authenticate;
    }
}
