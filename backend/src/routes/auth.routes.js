import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { transformUserToDto } from '../utils/dtoTransformers.js';
import { setAuthCookies, generateXsrfToken, clearAuthCookies } from '../utils/cookieUtils.js';
import { sendOTPEmail, sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password. Returns JWT token for subsequent API calls.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@truco.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoicGxheWVyIn0..."
 *                   user:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     username: "John Doe"
 *                     email: "john@example.com"
 *                     role: "player"
 *                     avatar: ""
 *                     emailVerified: false
 *                     status: "active"
 *                     wallet:
 *                       balance: 100
 *                     stats:
 *                       wins: 5
 *                       losses: 2
 *                       matchesPlayed: 7
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error'
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account is suspended'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Generate XSRF token
    const xsrfToken = generateXsrfToken();

    // Set cookies for Unity client (access_token, refresh_token, XSRF-TOKEN)
    setAuthCookies(res, accessToken, refreshToken, xsrfToken);
    
    // Log successful login (no sensitive data)
    logger.info(`User logged in: ${user.email}`);

    // Transform to UserDto format
    const userDto = transformUserToDto(user.toObject());

    // Return response (cookies are set via Set-Cookie headers)
    // Still return token in body for backward compatibility with existing frontend
    res.json({
      success: true,
      token: accessToken,
      user: userDto
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login'
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new player
 *     description: Create a new player account. New players receive 100 coins by default.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: player@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                   example: "507f1f77bcf86cd799439011"
 *                 username:
 *                   type: string
 *                   description: Username
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User email
 *                   example: "player@example.com"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Registration successful"
 *                 AuthToken:
 *                   type: string
 *                   description: Authentication token (same as id)
 *                   example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register (for players)
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error'
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit email verification OTP
    const emailVerificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationTokenExpiry = new Date();
    emailVerificationTokenExpiry.setMinutes(emailVerificationTokenExpiry.getMinutes() + 10); // 10 minutes expiry

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'player',
      coins: 100, // Default 100 coins for new players
      emailVerificationToken: emailVerificationOTP,
      emailVerificationTokenExpiry
    });

    // Send verification email via email service (with OTP)
    await sendVerificationEmail(user.email, emailVerificationOTP, user.name);

    // Log transaction for initial coins with balance tracking
    await Transaction.create({
      userId: user._id,
      type: 'admin_add',
      amount: 100,
      description: 'Initial coins for new player registration',
      balanceBefore: 0,
      balanceAfter: 100
    });

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Generate XSRF token
    const xsrfToken = generateXsrfToken();

    // Set cookies for Unity client
    setAuthCookies(res, accessToken, refreshToken, xsrfToken);

    // Transform to UserDto format
    const userDto = transformUserToDto(user.toObject());

    // Return RegisterResponse format with _id for consistency
    const userId = user._id.toString();
    res.status(201).json({
      _id: userId,
      username: userDto.username || user.name,
      email: user.email,
      message: 'Registration successful',
      AuthToken: userId // Same as _id
    });
  } catch (error) {
    logger.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }
    res.status(500).json({
      error: 'Server error during registration'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   user:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     username: "John Doe"
 *                     email: "john@example.com"
 *                     role: "player"
 *                     avatar: ""
 *                     emailVerified: false
 *                     status: "active"
 *                     wallet:
 *                       balance: 100
 *                     stats:
 *                       wins: 5
 *                       losses: 2
 *                       matchesPlayed: 7
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Transform to UserDto format
    const userDto = transformUserToDto(user.toObject());

    res.json({
      success: true,
      user: userDto
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout the current user. In JWT-based systems, logout is primarily handled client-side by removing the token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Logout (token invalidation on client side)
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Clear cookies for Unity client
    clearAuthCookies(res);
    
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout event for analytics
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token using the refresh token cookie. Unity client calls this automatically on 401/403.
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: New access_token, refresh_token, and XSRF-TOKEN cookies
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid refresh token
 */
// Refresh token endpoint for Unity client
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token not provided'
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Verify user still exists and is active
      const user = await User.findById(decoded.userId).select('id email name role status');
      
      if (!user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          error: 'Account is suspended'
        });
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Generate new XSRF token
      const xsrfToken = generateXsrfToken();

      // Set new cookies
      setAuthCookies(res, accessToken, newRefreshToken, xsrfToken);

      // Return success (tokens are in cookies)
      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (tokenError) {
      if (tokenError.name === 'JsonWebTokenError' || tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Invalid or expired refresh token'
        });
      }
      throw tokenError;
    }
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Server error during token refresh'
    });
  }
});

/**
 * @swagger
 * /api/auth/check-admin:
 *   get:
 *     summary: Check if user is admin
 *     description: Verify if the authenticated user has admin role.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isAdmin:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Check if user is admin
router.get('/check-admin', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    logger.error('Check admin error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verify user's email address using the 6-digit OTP code sent to their email.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: 6-digit verification OTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid verification OTP
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
// Verify email
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').notEmpty().withMessage('Verification OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.warn(`Email verification attempted for non-existent user: ${email}`);
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      logger.info(`Email verification attempted for already verified user: ${email}`);
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    // Check if OTP exists and is valid
    if (!user.emailVerificationToken || !user.emailVerificationTokenExpiry) {
      logger.warn(`Email verification OTP not found for user: ${email}`);
      logger.debug(`User emailVerified: ${user.emailVerified}, emailVerificationToken: ${user.emailVerificationToken}, emailVerificationTokenExpiry: ${user.emailVerificationTokenExpiry}`);
      return res.status(400).json({
        error: 'Verification OTP not found. Please request a new OTP using /api/auth/resend-verification endpoint.'
      });
    }

    // Check if OTP is expired
    const now = new Date();
    if (now > user.emailVerificationTokenExpiry) {
      logger.warn(`Email verification OTP expired for user: ${email}. Expiry: ${user.emailVerificationTokenExpiry}, Now: ${now}`);
      // Clear expired OTP
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
      await user.save();
      
      return res.status(400).json({
        error: 'Verification OTP expired. Please request a new OTP using /api/auth/resend-verification endpoint.'
      });
    }

    // Verify OTP
    if (user.emailVerificationToken !== otp) {
      logger.warn(`Invalid OTP provided for user: ${email}. Expected: ${user.emailVerificationToken}, Provided: ${otp}`);
      return res.status(400).json({
        error: 'Invalid verification OTP'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({
      error: 'Server error during email verification'
    });
  }
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     description: Resend verification email to user's email address. Requires email parameter.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *                 token:
 *                   type: string
 *                   description: Verification token (for testing purposes)
 *       400:
 *         description: Email already verified or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email already verified
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error'
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    // Generate new 6-digit verification OTP
    const emailVerificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationTokenExpiry = new Date();
    emailVerificationTokenExpiry.setMinutes(emailVerificationTokenExpiry.getMinutes() + 10); // 10 minutes expiry

    // Update user with new OTP
    user.emailVerificationToken = emailVerificationOTP;
    user.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    await user.save();

    logger.info(`Verification email resent for user: ${user.email}`);

    // Send verification email via email service (with OTP)
    const emailSent = await sendVerificationEmail(user.email, emailVerificationOTP, user.name);

    if (!emailSent && process.env.NODE_ENV === 'production') {
      logger.error(`Failed to send verification email to ${user.email}`);
      return res.status(500).json({
        error: 'Failed to send verification email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
      // Token is never returned in production for security
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Server error during resend verification'
    });
  }
});

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user email
 *     description: Generate and send OTP code to user's email address for verification
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       400:
 *         description: Validation error or user not found
 *       404:
 *         description: User not found
 */
// Send OTP
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error'
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to user
    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await user.save();

    logger.info(`OTP sent to user: ${user.email}`);

    // Send OTP via email service
    const emailSent = await sendOTPEmail(user.email, otpCode, user.name);

    // In development mode, if email service is not configured, return OTP in response
    if (process.env.NODE_ENV === 'development' && !emailSent) {
      logger.info(`OTP for ${user.email}: ${otpCode}`);
      
      return res.json({
        success: true,
        message: 'OTP sent successfully (check console for OTP in dev mode)',
        otp: otpCode, // Only in development mode when email service not configured
        expiresIn: '10 minutes'
      });
    }

    if (!emailSent && process.env.NODE_ENV === 'production') {
      logger.error(`Failed to send OTP email to ${user.email}`);
      return res.status(500).json({
        error: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    logger.error('Send OTP error:', error);
    res.status(500).json({
      error: 'Server error during OTP send'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     description: Verify OTP code and return UserDto if successful
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: OTP code received via email
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address (optional - if not provided, user will be found by OTP code)
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "OTP verified successfully"
 *                   user:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     username: "John Doe"
 *                     email: "john@example.com"
 *                     role: "player"
 *                     avatar: ""
 *                     emailVerified: true
 *                     status: "active"
 *                     wallet:
 *                       balance: 100
 *                     stats:
 *                       wins: 5
 *                       losses: 2
 *                       matchesPlayed: 7
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
// Verify OTP
router.post('/verify-otp', [
  body('email').optional().isEmail().normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error'
      });
    }

    const { email, otp } = req.body;

    // Find user by email if provided, otherwise by OTP code (matching C# OTPRequest structure)
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      // Find user by OTP code (for C# client compatibility)
      user = await User.findOne({ 
        otpCode: otp,
        otpExpiry: { $gt: new Date() } // Not expired
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found or invalid OTP'
      });
    }

    // Check if OTP exists and is valid
    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({
        error: 'OTP not found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otpCode = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(400).json({
        error: 'OTP expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP'
      });
    }

    // OTP verified successfully - clear OTP and mark email as verified
    user.otpCode = null;
    user.otpExpiry = null;
    user.emailVerified = true; // Mark email as verified when OTP is verified
    await user.save();

    logger.info(`OTP verified and email marked as verified for user: ${user.email}`);

    // Transform to UserDto format
    const userDto = transformUserToDto(user.toObject());

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: userDto
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    res.status(500).json({
      error: 'Server error during OTP verification'
    });
  }
});

export default router;
