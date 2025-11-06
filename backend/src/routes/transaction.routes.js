import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { userId, type, limit = 100 } = req.query;
    
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('matchId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      userId: transaction.userId?._id?.toString() || transaction.userId?.toString(),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      matchId: transaction.matchId?._id?.toString() || transaction.matchId?.toString() || null,
      timestamp: transaction.createdAt,
      userName: transaction.userId?.name || 'Unknown',
      userEmail: transaction.userId?.email || 'Unknown'
    }));

    res.json({
      success: true,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
