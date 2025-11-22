import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { transformTransactionToDto } from '../utils/dtoTransformers.js';

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
 *           enum: [match_entry, match_win, tournament_entry, tournament_win, coin_purchase, admin_add, admin_remove]
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
      .populate('userId')
      .populate('matchId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Transform to TransactionDto format
    const formattedTransactions = transactions.map(transaction => 
      transformTransactionToDto(transaction, null)
    );

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

/**
 * @swagger
 * /api/transactions/export:
 *   get:
 *     summary: Export transactions (Admin only)
 *     description: Export transaction history as CSV or JSON
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transaction export file
 *       403:
 *         description: Admin access required
 */
/**
 * Export transactions (Admin only)
 * Supports CSV and JSON formats
 */
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const { format = 'csv', userId, type } = req.query;

    // Build query
    const query = {};
    if (userId) {
      query.userId = userId;
    }
    if (type) {
      query.type = type;
    }

    // Fetch transactions with populated data
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('matchId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'json') {
      // JSON export
      const exportData = transactions.map(transaction => ({
        _id: transaction._id.toString(),
        userId: transaction.userId?._id?.toString() || transaction.userId?.toString(),
        username: transaction.userId?.name || transaction.userId?.username || 'Unknown',
        userEmail: transaction.userId?.email || 'Unknown',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || '',
        matchId: transaction.matchId?._id?.toString() || transaction.matchId?.toString() || null,
        matchName: transaction.matchId?.name || null,
        timestamp: transaction.createdAt,
        createdAt: transaction.createdAt
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.json`);
      res.json({ transactions: exportData });
    } else {
      // CSV export
      const csvHeaders = [
        'ID',
        'User ID',
        'User Name',
        'User Email',
        'Type',
        'Amount',
        'Description',
        'Match ID',
        'Match Name',
        'Timestamp'
      ];

      const csvRows = transactions.map(transaction => {
        return [
          transaction._id.toString(),
          transaction.userId?._id?.toString() || transaction.userId?.toString() || '',
          transaction.userId?.name || transaction.userId?.username || 'Unknown',
          transaction.userId?.email || 'Unknown',
          transaction.type || '',
          transaction.amount || 0,
          `"${(transaction.description || '').replace(/"/g, '""')}"`,
          transaction.matchId?._id?.toString() || transaction.matchId?.toString() || '',
          transaction.matchId?.name || '',
          transaction.createdAt ? new Date(transaction.createdAt).toISOString() : ''
        ].join(',');
      });

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    }
  } catch (error) {
    logger.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
