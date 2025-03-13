import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/**
 * Middleware to check role-based access
 * @param {Array} allowedRoles - Roles allowed to access the route
 */
export const authorizeRoles = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized, token missing' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user details from the database
            const user = await User.findByPk(decoded.id, { raw: true });
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized, user not found' });
            }

            // Check if the user's role is allowed
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
            }

            // Attach the full user information to the request object
            req.user = user;

            next(); // User is authorized
        } catch (error) {
            res.status(401).json({ message: 'Unauthorized, invalid token' });
        }
    };
};

export const isAdmin = (role) => role === "admin";