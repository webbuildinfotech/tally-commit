export const ERROR_TYPES = {
    ALREADY_EXISTS: {
        code: 'ALREADY_EXISTS',
        status: 400,
        message: 'Resource already exists'
    },
    NOT_FOUND: {
        code: 'NOT_FOUND',
        status: 404,
        message: 'Resource not found'
    },
    VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Validation failed'
    },
    EVENT_EXPIRED: {
        code: 'EVENT_EXPIRED',
        status: 400,
        message: 'Event has expired'
    },
    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Unauthorized access'
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        status: 500,
        message: 'Database operation failed'
    },
    SERVER_ERROR: {
        code: 'SERVER_ERROR',
        status: 500,
        message: 'Internal server error'
    }
}; 