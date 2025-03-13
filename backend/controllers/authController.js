import {
    registerUser,
    loginUser,
    forgetService,
    resetService,
    verifyUserOtp,
    resendUserOtp,
    checkUserExistsService
} from '../services/authService.js';

/**
 * Check if the user exists by email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const checkUserExists = async (req, res) => {
    const { email } = req.query;

    try {
        const user = await checkUserExistsService(email);

        if (user) {
            return res.status(200).json({
                success: true,
                message: 'User exists.',
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        }

        return res.status(404).json({
            success: false,
            message: 'User does not exist.',
        });

    } catch (error) {
        console.error('Error checking user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Register a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const register = async (req, res) => {
    try {
        await registerUser(req.body);
        return res.status(201).json({
            message: 'User registered successfully. Please verify your email.'
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

/**
 * Verify user OTP.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await verifyUserOtp(email, otp);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

/**
 * Resend user OTP.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await resendUserOtp(email);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

/**
 * Login user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUser(email, password);
        return res.status(200).json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

/**
 * Generate OTP for forget password flow.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = await forgetService(email);
        console.log(resetToken);
        return res.status(200).json({
            message: 'Reset OTP generated'
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

/**
 * Reset the user's password.
 * @param {Object} req - The request object containing OTP, new password, and email.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} - The response message indicating success or failure.
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Call the reset service with OTP and new password.
        await resetService(email, otp, newPassword);

        return res.status(200).json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};


/**
 * Logout user by clearing the token from cookies or handling token invalidation.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response message.
 */
export const logout = async (req, res) => {
    try {
        // If using cookies to store JWT, clear it
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure flag in production
            sameSite: "Strict",
        });

        return res.status(200).json({
            message: "Logout successful",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error during logout",
        });
    }
};
