import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of all transactions with optional filtering by user and type
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter transactions by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [match_entry, match_win, match_loss, tournament_entry, tournament_win, admin_add, admin_remove]
 *         description: Filter transactions by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of transactions to return
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
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
    logger.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
