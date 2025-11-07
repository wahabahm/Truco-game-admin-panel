import express from 'express';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns overall platform statistics including users, coins, matches, and tournaments
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
 *                     totalCoins:
 *                       type: number
 *                     activePlayers:
 *                       type: number
 *                     ongoingMatches:
 *                       type: number
 *                     ongoingTournaments:
 *                       type: number
 *                     completedMatches:
 *                       type: number
 *                     completedTournaments:
 *                       type: number
 */
/**
 * Get dashboard stats
 * Returns overall platform statistics
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

    // Active players
    const activePlayers = await User.countDocuments({ role: 'player', status: 'active' });

    // Ongoing matches
    const ongoingMatches = await Match.countDocuments({ status: 'active' });

    // Ongoing tournaments
    const ongoingTournaments = await Tournament.countDocuments({ status: 'active' });

    // Completed matches
    const completedMatches = await Match.countDocuments({ status: 'completed' });

    // Completed tournaments
    const completedTournaments = await Tournament.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCoins,
        activePlayers,
        ongoingMatches,
        ongoingTournaments,
        completedMatches,
        completedTournaments
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

/**
 * @swagger
 * /api/dashboard/economy:
 *   get:
 *     summary: Get economy statistics
 *     description: Returns detailed coin statistics including issued coins, coins in circulation, and usage statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Economy statistics retrieved successfully
 */
/**
 * Get economy statistics
 * Returns detailed coin statistics (issued, in circulation, used in tournaments)
 */
router.get('/economy', async (req, res) => {
  try {
    // Total coins in circulation (current user balances)
    const totalCoinsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);
    const totalCoinsInCirculation = totalCoinsResult[0]?.total || 0;

    // Total coins issued (sum of all positive transactions)
    const totalIssuedResult = await Transaction.aggregate([
      { $match: { amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCoinsIssued = totalIssuedResult[0]?.total || 0;

    // Coins used in tournaments (entry fees)
    const tournamentCoinsResult = await Transaction.aggregate([
      { $match: { type: 'tournament_entry', amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);
    const coinsUsedInTournaments = tournamentCoinsResult[0]?.total || 0;

    // Coins used in matches (entry fees)
    const matchCoinsResult = await Transaction.aggregate([
      { $match: { type: 'match_entry', amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);
    const coinsUsedInMatches = matchCoinsResult[0]?.total || 0;

    // Prizes distributed
    const prizesDistributedResult = await Transaction.aggregate([
      { $match: { $or: [{ type: 'match_win' }, { type: 'tournament_win' }] } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const prizesDistributed = prizesDistributedResult[0]?.total || 0;

    res.json({
      success: true,
      economy: {
        totalCoinsInCirculation,
        totalCoinsIssued,
        coinsUsedInTournaments,
        coinsUsedInMatches,
        prizesDistributed,
        totalCoinsUsed: coinsUsedInTournaments + coinsUsedInMatches
      }
    });
  } catch (error) {
    logger.error('Get economy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/user-growth:
 *   get:
 *     summary: Get user growth data
 *     description: Returns monthly user registration and match completion data for the last 6 months
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User growth data retrieved successfully
 */
/**
 * Get user growth data (monthly for last 6 months)
 */
router.get('/user-growth', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get monthly user registrations
    const userGrowth = await User.aggregate([
      {
        $match: {
          role: 'player',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get monthly match completions
    const matchGrowth = await Match.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          matches: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get monthly tournament completions
    const tournamentGrowth = await Tournament.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          tournaments: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      const userData = userGrowth.find(u => 
        u._id.year === date.getFullYear() && u._id.month === date.getMonth() + 1
      );
      const matchData = matchGrowth.find(m => 
        m._id.year === date.getFullYear() && m._id.month === date.getMonth() + 1
      );
      const tournamentData = tournamentGrowth.find(t => 
        t._id.year === date.getFullYear() && t._id.month === date.getMonth() + 1
      );

      data.push({
        month: monthNames[date.getMonth()],
        users: userData?.users || 0,
        matches: matchData?.matches || 0,
        tournaments: tournamentData?.tournaments || 0
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/weekly-activity:
 *   get:
 *     summary: Get weekly activity data
 *     description: Returns daily active users and match completions for the last 7 days
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly activity data retrieved successfully
 */
/**
 * Get weekly activity data (last 7 days)
 */
router.get('/weekly-activity', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get daily active users (users who logged in or had activity)
    const activeUsers = await User.aggregate([
      {
        $match: {
          role: 'player',
          updatedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily match completions
    const dailyMatches = await Match.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          matches: { $sum: 1 }
        }
      }
    ]);

    // Format data for last 7 days
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const activeData = activeUsers.find(a => 
        a._id.year === date.getFullYear() &&
        a._id.month === date.getMonth() + 1 &&
        a._id.day === date.getDate()
      );
      const matchData = dailyMatches.find(m => 
        m._id.year === date.getFullYear() &&
        m._id.month === date.getMonth() + 1 &&
        m._id.day === date.getDate()
      );

      data.push({
        day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1], // Convert Sunday=0 to Sunday=6
        active: activeData?.count || 0,
        matches: matchData?.matches || 0
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get weekly activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity feed
 *     description: Returns a feed of recent activities including matches, tournaments, users, and transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activity feed retrieved successfully
 */
/**
 * Get recent activity feed
 */
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = [];

    // Get recent matches
    const recentMatches = await Match.find()
      .populate('player1Id', 'name')
      .populate('player2Id', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    recentMatches.forEach(match => {
      if (match.status === 'active') {
        activities.push({
          id: match._id.toString(),
          type: 'match',
          action: 'New match started',
          user: match.name,
          time: match.createdAt,
          status: 'active'
        });
      } else if (match.status === 'completed') {
        activities.push({
          id: match._id.toString(),
          type: 'match',
          action: 'Match completed',
          user: match.winnerId ? `Winner: ${match.winnerId.name || 'Unknown'}` : match.name,
          time: match.completedAt || match.createdAt,
          status: 'completed'
        });
      }
    });

    // Get recent tournaments
    const recentTournaments = await Tournament.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    recentTournaments.forEach(tournament => {
      if (tournament.status === 'completed') {
        activities.push({
          id: tournament._id.toString(),
          type: 'tournament',
          action: 'Tournament completed',
          user: tournament.name,
          time: tournament.completedAt || tournament.createdAt,
          status: 'completed'
        });
      } else if (tournament.status === 'active') {
        activities.push({
          id: tournament._id.toString(),
          type: 'tournament',
          action: 'Tournament started',
          user: tournament.name,
          time: tournament.createdAt,
          status: 'active'
        });
      }
    });

    // Get recent users
    const recentUsers = await User.find({ role: 'player' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    recentUsers.forEach(user => {
      activities.push({
        id: user._id.toString(),
        type: 'user',
        action: 'New user registered',
        user: user.name || user.email,
        time: user.createdAt,
        status: 'new'
      });
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    recentTransactions.forEach(transaction => {
      if (transaction.type === 'match_win' || transaction.type === 'tournament_win') {
        activities.push({
          id: transaction._id.toString(),
          type: 'transaction',
          action: `Prize won: ${transaction.amount} coins`,
          user: transaction.userId?.name || transaction.userId?.email || 'Unknown',
          time: transaction.createdAt,
          status: 'transaction'
        });
      }
    });

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, limit);

    // Format time
    const formatTime = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const formattedActivities = limitedActivities.map(activity => ({
      ...activity,
      time: formatTime(activity.time)
    }));

    res.json({
      success: true,
      activities: formattedActivities
    });
  } catch (error) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/system/status:
 *   get:
 *     summary: Get system status (Admin only)
 *     description: Returns system health, database status, and basic metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *       403:
 *         description: Admin access required
 */
/**
 * Get system status (admin only)
 * Returns system health, database status, and basic metrics
 */
router.get('/system/status', requireAdmin, async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get system metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({ status: 'active' });
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ status: 'active' });

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments();

    // Memory usage (basic)
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      status: {
        system: 'operational',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        metrics: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: totalUsers - activeUsers
          },
          matches: {
            total: totalMatches,
            active: activeMatches,
            completed: totalMatches - activeMatches
          },
          tournaments: {
            total: totalTournaments,
            active: activeTournaments,
            completed: totalTournaments - activeTournaments
          },
          transactions: {
            total: totalTransactions
          }
        },
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
        }
      }
    });
  } catch (error) {
    logger.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
