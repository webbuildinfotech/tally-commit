import { ERROR_TYPES } from '../constants/errorCodes.js';

class AppError extends Error {
    constructor(type, customMessage = null, data = null) {
        const errorType = ERROR_TYPES[type] || ERROR_TYPES.SERVER_ERROR;
        super(customMessage || errorType.message);
        
        this.type = type;
        this.status = errorType.status;
        this.code = errorType.code;
        this.data = data;
    }
}

export const handleResponse = (res, data = null, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: status < 400,
        message,
        ...(data && { data })
    });
};

export const handleError = (error, req, res) => {
    console.error('Error:', {
        type: error.type,
        message: error.message,
        path: req.path,
        method: req.method,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

    return res.status(error.status || 500).json({
        success: false,
        code: error.code || 'SERVER_ERROR',
        message: error.message,
        ...(error.data && { data: error.data }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

export default AppError; 