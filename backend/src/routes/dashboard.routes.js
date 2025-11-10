import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns comprehensive platform statistics including total registered players, coin circulation, coin issuance, and usage statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                       description: Total number of registered players
 *                     totalCoins:
 *                       type: number
 *                       description: Total coins in circulation
 *                     coinsIssued:
 *                       type: number
 *                       description: Total coins ever issued (from positive transactions)
 *                     coinsUsedInTournaments:
 *                       type: number
 *                       description: Total coins used in tournament entry fees
 *                     coinsUsedInMatches:
 *                       type: number
 *                       description: Total coins used in match entry fees
 */
/**
 * Get dashboard stats
 * Returns comprehensive platform statistics including coin breakdown
 */
router.get('/stats', async (req, res) => {
  try {
    // Total users (players only)
    const totalUsers = await User.countDocuments({ role: 'player' });

    // Total coins in circulation
    const totalCoinsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);
    const totalCoins = totalCoinsResult[0]?.total || 0;

    // Coins issued (total positive transactions: admin_add, match_win, tournament_win, coin_purchase)
    const coinsIssuedResult = await Transaction.aggregate([
      {
        $match: {
          type: { $in: ['admin_add', 'match_win', 'tournament_win', 'coin_purchase'] },
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
    const coinsIssued = coinsIssuedResult[0]?.total || 0;

    // Coins used in tournaments (total tournament_entry fees - negative amounts)
    const coinsUsedInTournamentsResult = await Transaction.aggregate([
      {
        $match: {
          type: 'tournament_entry',
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
    const coinsUsedInTournaments = coinsUsedInTournamentsResult[0]?.total || 0;

    // Coins used in matches (total match_entry fees - negative amounts)
    const coinsUsedInMatchesResult = await Transaction.aggregate([
      {
        $match: {
          type: 'match_entry',
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
    const coinsUsedInMatches = coinsUsedInMatchesResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCoins,
        coinsIssued,
        coinsUsedInTournaments,
        coinsUsedInMatches
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


export default router;
