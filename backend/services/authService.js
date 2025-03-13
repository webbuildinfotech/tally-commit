import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Op } from 'sequelize';
import { sendEmail } from '../utils/transporter.js';

/**
 * Check if a user exists in the database by email.
 * @param {string} email - Email to check.
 * @returns {object|null} - User object if exists, otherwise null.
 */
export const checkUserExistsService = async (email) => {
    if (!email) {
        throw new Error("Please enter email.");
    }

    const user = await User.findOne({ where: { email } });
    return user; // Returns user object if found, otherwise null
};

/**
 * Register a new user in the database.
 * @param {object} data - User data.
 * @returns {object} - The created user.
 */
export const registerUser = async (data) => {
    const existingUserByEmail = await User.findOne({ where: { email: data.email } });

    if (existingUserByEmail) {
        throw new Error('Email already exists');
    }

    data.password = await bcrypt.hash(data.password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP valid for 5 minutes

    const user = await User.create({
        ...data,
        otp,
        otpExpiry,
        isVerify: false
    });

    await sendEmail(data.email, 'Verify Your Account', `Your OTP is: ${otp} (Valid for 5 minutes)`);
    return user;
};

/**
 * Verify user OTP.
 * @param {string} email - User's email.
 * @param {string} otp - OTP to verify.
 * @returns {object} - Response message.
 */
export const verifyUserOtp = async (email, otp) => {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User not found');
    if (!user.otp || user.otp !== otp) throw new Error('Invalid OTP');
    if (new Date() > user.otpExpiry) throw new Error('OTP has expired');

    user.isVerify = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return { message: 'Account verified successfully. You can now login.' };
};

/**
 * Resend OTP to the user.
 * @param {string} email - User's email.
 * @returns {object} - Response message.
 */
export const resendUserOtp = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User not found');
    if (user.isVerify) throw new Error('Account is already verified');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(email, 'New OTP Request', `Your new OTP is: ${otp} (Valid for 5 minutes)`);

    return { message: 'New OTP sent successfully. Please check your email.' };
};

/**
 * Login the user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {object} - User data and token.
 */
export const loginUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User not found');
    if (!user.isVerify) throw new Error('Account is not verified');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isVerify: user.isVerify,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
};

/**
 * Generate OTP for password reset.
 * @param {string} email - User's email.
 * @returns {string} - The generated OTP.
 */
export const forgetService = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetToken = otp;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

    return otp;
};

/**
 * Reset the user's password using the OTP.
 * @param {string} email - The user's email.
 * @param {string} otp - The OTP for password reset.
 * @param {string} newPassword - The new password to set.
 */
export const resetService = async (email, otp, newPassword) => {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User not found');
    if (user.resetToken !== otp) throw new Error('Invalid OTP');
    if (new Date() > user.resetTokenExpiry) throw new Error('OTP has expired');

    // Hash the new password and update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();
};