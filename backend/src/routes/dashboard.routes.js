import express from 'express';
import User from '../models/User.js';
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
 *     description: Returns basic platform statistics (total registered players and total coins in circulation)
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
 */
/**
 * Get dashboard stats
 * Returns basic platform statistics (total users and total coins)
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

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCoins
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
