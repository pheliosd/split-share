import { AppError, AppErrors } from '../../common/errors/AppError';

describe('AppError', () => {
    it('should create an error with correct properties', () => {
        const err = new AppError('Not found', 404, 'NOT_FOUND');
        expect(err.message).toBe('Not found');
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
        expect(err.isOperational).toBe(true);
    });

    it('should be an instance of Error', () => {
        const err = new AppError('test', 400, 'TEST');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
    });

    it('toJSON should return correct shape', () => {
        const err = new AppError('Forbidden', 403, 'FORBIDDEN');
        expect(err.toJSON()).toEqual({
            error: {
                code: 'FORBIDDEN',
                message: 'Forbidden',
                statusCode: 403,
            },
        });
    });
});

describe('AppErrors factories', () => {
    it('notFound should return 404', () => {
        const err = AppErrors.notFound('User');
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
        expect(err.message).toContain('User');
    });

    it('unauthorized should return 401', () => {
        const err = AppErrors.unauthorized();
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('UNAUTHORIZED');
    });

    it('forbidden should return 403', () => {
        const err = AppErrors.forbidden();
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('FORBIDDEN');
    });

    it('badRequest should return 400', () => {
        const err = AppErrors.badRequest('Invalid input');
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('BAD_REQUEST');
    });

    it('conflict should return 409', () => {
        const err = AppErrors.conflict('Already exists');
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('CONFLICT');
    });

    it('validationError should return 422', () => {
        const err = AppErrors.validationError('Invalid email');
        expect(err.statusCode).toBe(422);
        expect(err.code).toBe('VALIDATION_ERROR');
    });

    it('internal should be non-operational', () => {
        const err = AppErrors.internal();
        expect(err.statusCode).toBe(500);
        expect(err.isOperational).toBe(false);
    });
});
