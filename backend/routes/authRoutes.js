import express from 'express';
import {
  register,
  login,
  forgetPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  checkUserExists,
  logout,
} from '../controllers/authController.js';

import {
  validateRegistration,
  validateLogin,
  validateForgetPassword,
  validateResetPassword,
  validateVerifyOtp,
  validateResendOtp,
  validateCheckUserExists,
} from '../middleware/validationMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js'; // Utility for handling async functions
import { rateLimiter } from '../middleware/rateLimiter.js'; // Optional: Rate limiting for security

const router = express.Router();

// Apply rate limiting to all auth routes (optional but recommended)
router.use(rateLimiter);

// Register a new user
router.post('/register', validateRegistration, asyncHandler(register));

// Check if a user exists by email
router.get('/check-user', validateCheckUserExists, asyncHandler(checkUserExists));

// Verify OTP
router.post('/verify-otp', validateVerifyOtp, asyncHandler(verifyOtp));

// Resend OTP
router.post('/resend-otp', validateResendOtp, asyncHandler(resendOtp));

// User login
router.post('/login', validateLogin, asyncHandler(login));

// Forget password
router.post('/forget', validateForgetPassword, asyncHandler(forgetPassword));

// Reset password
router.post('/reset', validateResetPassword, asyncHandler(resetPassword));

// Logout user
router.post('/logout', asyncHandler(logout));

export default router;