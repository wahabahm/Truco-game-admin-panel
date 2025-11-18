import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { transformUserToDto } from '../utils/dtoTransformers.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with optional search and status filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended]
 *         description: Filter users by status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all users (with search)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      const mongoose = (await import('mongoose')).default;
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      
      // Try to match ObjectId if search looks like one
      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      
      query.$or = searchConditions;
    }

    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Transform to UserDto format
    const formattedUsers = users.map(user => transformUserToDto(user));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register new player (Admin only)
 *     description: Create a new player account. Only admins can register players through the admin panel. New players receive 100 coins by default.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Player registered successfully
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
 *                   example: Player registered successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already exists
 *       403:
 *         description: Admin access required
 */
// Register new player (admin only) - MUST be before /:id route
router.post('/register', requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const bcrypt = (await import('bcryptjs')).default;
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
      status: 'active',
      emailVerificationToken: emailVerificationOTP,
      emailVerificationTokenExpiry
    });

    // Log transaction for initial coins with balance tracking
    await Transaction.create({
      userId: user._id,
      type: 'admin_add',
      amount: 100,
      description: 'Initial coins for new player registration',
      balanceBefore: 0,
      balanceAfter: 100
    });

    // Transform to UserDto format
    const userDto = transformUserToDto(user.toObject());

    // Log user registration (no sensitive data)
    logger.info(`New player registered: ${user.email}`);

    // Send verification email via email service (with OTP)
    const { sendVerificationEmail } = await import('../utils/emailService.js');
    await sendVerificationEmail(user.email, emailVerificationOTP, user.name);
    
    res.status(201).json({
      success: true,
      message: 'Player registered successfully. Email verification required.',
      user: userDto
      // Token is never returned in production for security
    });
  } catch (error) {
    logger.error('Admin register player error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform to UserDto format
    const userDto = transformUserToDto(user);

    res.json({
      success: true,
      user: userDto
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     description: Returns detailed statistics for a user including matches, tournaments, and economy data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     matches:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         won:
 *                           type: number
 *                         lost:
 *                           type: number
 *                         winRate:
 *                           type: string
 *                     tournaments:
 *                       type: object
 *                     economy:
 *                       type: object
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
/**
 * Get user statistics (admin only)
 * Returns detailed stats: matches played, tournaments, transactions, etc.
 */
router.get('/:id/stats', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const Match = (await import('../models/Match.js')).default;
    const Tournament = (await import('../models/Tournament.js')).default;

    // Get match statistics
    const matchesPlayed = await Match.countDocuments({
      $or: [
        { player1Id: id },
        { player2Id: id }
      ]
    });

    const matchesWon = await Match.countDocuments({
      winnerId: id,
      status: 'completed'
    });

    const matchesLost = matchesPlayed - matchesWon;

    // Get tournament statistics
    const tournamentsJoined = await Tournament.countDocuments({
      participants: id
    });

    const tournamentsWon = await Tournament.countDocuments({
      winnerId: id,
      status: 'completed'
    });

    // Get transaction statistics
    const totalCoinsEarned = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          amount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalCoinsSpent = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          amount: { $lt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } }
        }
      }
    ]);

    // Get recent transactions count
    const recentTransactions = await Transaction.countDocuments({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Transform user to UserDto format
    const userDto = transformUserToDto(user.toObject());

    res.json({
      success: true,
      stats: {
        user: userDto,
        matches: {
          total: matchesPlayed,
          won: matchesWon,
          lost: matchesLost,
          winRate: matchesPlayed > 0 ? ((matchesWon / matchesPlayed) * 100).toFixed(2) : 0
        },
        tournaments: {
          joined: tournamentsJoined,
          won: tournamentsWon,
          winRate: tournamentsJoined > 0 ? ((tournamentsWon / tournamentsJoined) * 100).toFixed(2) : 0
        },
        economy: {
          currentBalance: user.coins,
          totalEarned: totalCoinsEarned[0]?.total || 0,
          totalSpent: totalCoinsSpent[0]?.total || 0,
          netCoins: (totalCoinsEarned[0]?.total || 0) - (totalCoinsSpent[0]?.total || 0)
        },
        activity: {
          recentTransactions: recentTransactions
        }
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status (Admin only)
 *     description: Activate or suspend a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended]
 *                 example: active
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
// Update user status (admin only)
router.patch('/:id/status', requireAdmin, [
  body('status').isIn(['active', 'suspended']).withMessage('Status must be active or suspended')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Prevent admin from suspending themselves
    if (req.user.id === id && status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('id name email status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status
      },
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`
    });
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/coins:
 *   patch:
 *     summary: Update user coins (Admin only)
 *     description: Add or remove coins from a user's account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - operation
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               operation:
 *                 type: string
 *                 enum: [add, remove]
 *                 example: add
 *     responses:
 *       200:
 *         description: Coins updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
// Update user coins (admin only)
router.patch('/:id/coins', requireAdmin, [
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  body('operation').isIn(['add', 'remove']).withMessage('Operation must be add or remove')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { amount, operation } = req.body;

    // Prevent admin from managing their own coins
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot manage your own coins'
      });
    }

    // Get current user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Track balance before transaction
    const balanceBefore = user.coins;
    
    // Update coins atomically (prevents race conditions)
    const coinChange = operation === 'add' ? amount : -Math.min(amount, user.coins);
    const actualAmount = operation === 'add' ? amount : Math.min(amount, user.coins);
    const balanceAfter = balanceBefore + coinChange;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $inc: { coins: coinChange } },
      { new: true }
    );

    // Log transaction with balance tracking
    await Transaction.create({
      userId: user._id,
      type: operation === 'add' ? 'admin_add' : 'admin_remove',
      amount: operation === 'add' ? actualAmount : -actualAmount,
      description: `Admin ${operation === 'add' ? 'added' : 'removed'} ${actualAmount} coins`,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter
    });

    // Transform to UserDto format
    const userDto = transformUserToDto(updatedUser.toObject());

    res.json({
      success: true,
      message: `Coins ${operation === 'add' ? 'added' : 'removed'} successfully`,
      user: userDto
    });
  } catch (error) {
    logger.error('Update coins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
