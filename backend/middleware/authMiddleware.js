import AppError from '../utils/AppError.js';

export const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError('UNAUTHORIZED', 'Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw new AppError('FORBIDDEN', 'You do not have permission to perform this action');
        }
        next();
    };
};

// Helper function to check if user is admin or owner of the resource
export const isAdminOrOwner = (reqUser) => {
    return reqUser.role === 'admin' ;
}; 