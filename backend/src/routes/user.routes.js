import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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
      .select('id name email coins wins losses status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      coins: user.coins,
      wins: user.wins,
      losses: user.losses,
      status: user.status,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('id name email coins wins losses status createdAt').lean();

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
        coins: user.coins,
        wins: user.wins,
        losses: user.losses,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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

    res.json({
      success: true,
      stats: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          coins: user.coins,
          status: user.status,
          role: user.role,
          createdAt: user.createdAt
        },
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
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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

    // Get current user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate new coins
    let newCoins;
    if (operation === 'add') {
      newCoins = user.coins + amount;
    } else {
      newCoins = Math.max(0, user.coins - amount);
    }

    // Update coins
    user.coins = newCoins;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      type: operation === 'add' ? 'admin_add' : 'admin_remove',
      amount: operation === 'add' ? amount : -amount,
      description: `Admin ${operation === 'add' ? 'added' : 'removed'} ${amount} coins`
    });

    res.json({
      success: true,
      message: `Coins ${operation === 'add' ? 'added' : 'removed'} successfully`,
      user: {
        id: user._id.toString(),
        coins: newCoins
      }
    });
  } catch (error) {
    console.error('Update coins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
