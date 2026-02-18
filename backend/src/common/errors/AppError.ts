export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
            },
        };
    }
}

// Factory helpers
export const AppErrors = {
    notFound: (resource = 'Resource') =>
        new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

    unauthorized: (message = 'Unauthorized') =>
        new AppError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message = 'Forbidden') =>
        new AppError(message, 403, 'FORBIDDEN'),

    badRequest: (message: string, code = 'BAD_REQUEST') =>
        new AppError(message, 400, code),

    conflict: (message: string) =>
        new AppError(message, 409, 'CONFLICT'),

    internal: (message = 'Internal server error') =>
        new AppError(message, 500, 'INTERNAL_ERROR', false),

    validationError: (message: string) =>
        new AppError(message, 422, 'VALIDATION_ERROR'),
};
