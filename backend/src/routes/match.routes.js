import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     description: Retrieve a list of all matches. Can be filtered by status.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Filter matches by status
 *     responses:
 *       200:
 *         description: List of matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all matches
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('player1Id', 'name email')
      .populate('player2Id', 'name email')
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const formattedMatches = matches.map(match => {
      const players = (match.player1Id ? 1 : 0) + (match.player2Id ? 1 : 0);
      return {
        id: match._id.toString(),
        name: match.name,
        type: match.type,
        cost: match.cost,
        prize: match.prize,
        matchDate: match.matchDate,
        status: match.status,
        players,
        player1Id: match.player1Id?._id?.toString() || null,
        player2Id: match.player2Id?._id?.toString() || null,
        winnerId: match.winnerId?._id?.toString() || null,
        player1Name: match.player1Id?.name || null,
        player2Name: match.player2Id?.name || null,
        winnerName: match.winnerId?.name || null,
        createdAt: match.createdAt,
        completedAt: match.completedAt
      };
    });

    res.json({
      success: true,
      matches: formattedMatches
    });
  } catch (error) {
    logger.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/matches/export:
 *   get:
 *     summary: Export matches (Admin only)
 *     description: Export match history as CSV or JSON
 *     tags: [Matches]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Match export file
 *       403:
 *         description: Admin access required
 */
/**
 * Export matches (Admin only)
 * Supports CSV and JSON formats
 * NOTE: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const { format = 'csv', status } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Fetch matches with populated data
    const matches = await Match.find(query)
      .populate('player1Id', 'name email')
      .populate('player2Id', 'name email')
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'json') {
      // JSON export
      const exportData = matches.map(match => ({
        id: match._id.toString(),
        name: match.name,
        type: match.type,
        cost: match.cost,
        prize: match.prize,
        matchDate: match.matchDate || null,
        status: match.status,
        player1Id: match.player1Id?._id?.toString() || null,
        player1Name: match.player1Id?.name || null,
        player1Email: match.player1Id?.email || null,
        player2Id: match.player2Id?._id?.toString() || null,
        player2Name: match.player2Id?.name || null,
        player2Email: match.player2Id?.email || null,
        winnerId: match.winnerId?._id?.toString() || null,
        winnerName: match.winnerId?.name || null,
        completedAt: match.completedAt || null,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=matches_${new Date().toISOString().split('T')[0]}.json`);
      res.json({ matches: exportData });
    } else {
      // CSV export
      const csvHeaders = [
        'ID',
        'Name',
        'Type',
        'Cost',
        'Prize',
        'Match Date',
        'Status',
        'Player 1',
        'Player 1 Email',
        'Player 2',
        'Player 2 Email',
        'Winner',
        'Completed At',
        'Created At'
      ];

      const csvRows = matches.map(match => {
        return [
          match._id.toString(),
          `"${match.name || ''}"`,
          match.type || '',
          match.cost || 0,
          match.prize || 0,
          match.matchDate ? new Date(match.matchDate).toISOString() : '',
          match.status || '',
          match.player1Id?.name || '',
          match.player1Id?.email || '',
          match.player2Id?.name || '',
          match.player2Id?.email || '',
          match.winnerId?.name || '',
          match.completedAt ? new Date(match.completedAt).toISOString() : '',
          match.createdAt ? new Date(match.createdAt).toISOString() : ''
        ].join(',');
      });

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=matches_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    }
  } catch (error) {
    logger.error('Export matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get single match by ID
 *     description: Retrieve detailed information about a specific match.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get single match by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate('player1Id', 'name email coins')
      .populate('player2Id', 'name email coins')
      .populate('winnerId', 'name email')
      .lean();

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const players = (match.player1Id ? 1 : 0) + (match.player2Id ? 1 : 0);

    res.json({
      success: true,
      match: {
        id: match._id.toString(),
        name: match.name,
        type: match.type,
        cost: match.cost,
        prize: match.prize,
        matchDate: match.matchDate,
        status: match.status,
        players,
        player1Id: match.player1Id?._id?.toString() || null,
        player2Id: match.player2Id?._id?.toString() || null,
        winnerId: match.winnerId?._id?.toString() || null,
        player1Name: match.player1Id?.name || null,
        player2Name: match.player2Id?.name || null,
        winnerName: match.winnerId?.name || null,
        player1Email: match.player1Id?.email || null,
        player2Email: match.player2Id?.email || null,
        createdAt: match.createdAt,
        completedAt: match.completedAt
      }
    });
  } catch (error) {
    logger.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match (Admin only)
 *     description: Create a new 1v1 match. Only admins can create matches.
 *     tags: [Matches]
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
 *               - type
 *               - cost
 *               - prize
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Championship Match"
 *               type:
 *                 type: string
 *                 enum: [public, private]
 *                 example: "public"
 *               cost:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *               prize:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T10:00:00Z"
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create match (admin only)
router.post('/', requireAdmin, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('type').isIn(['public', 'private']).withMessage('Type must be public or private'),
  body('cost').isInt({ min: 1 }).withMessage('Cost must be a positive integer'),
  body('prize').isInt({ min: 1 }).withMessage('Prize must be a positive integer'),
  body('matchDate').optional().isISO8601().withMessage('Invalid date format')
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

    const { name, type, cost, prize, matchDate } = req.body;

    const match = await Match.create({
      name,
      type,
      cost: parseInt(cost),
      prize: parseInt(prize),
      matchDate: matchDate || null,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      match: {
        id: match._id.toString(),
        name: match.name,
        type: match.type,
        cost: match.cost,
        prize: match.prize,
        matchDate: match.matchDate,
        status: match.status,
        players: 0,
        createdAt: match.createdAt
      }
    });
  } catch (error) {
    logger.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/matches/auto-join:
 *   post:
 *     summary: Auto-join available match
 *     description: Automatically find and join the first available public match. Coins are automatically deducted.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully joined a match
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
 *                   example: "Successfully joined match"
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Insufficient coins or already in match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No available matches found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Auto-matchmaking: Automatically find and join an available match
router.post('/auto-join', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user.id;
      const userIdObj = new mongoose.Types.ObjectId(userId);

      // Check if user has enough coins first (optimization)
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Try to join as player1 first (atomic operation)
      let availableMatch = await Match.findOneAndUpdate(
        {
          status: 'active',
          type: 'public',
          player1Id: null,
          player2Id: { $ne: userIdObj }
        },
        {
          $set: { player1Id: userIdObj }
        },
        {
          new: true,
          sort: { createdAt: 1 },
          session
        }
      );

      // If no match with empty player1, try player2
      if (!availableMatch) {
        availableMatch = await Match.findOneAndUpdate(
          {
            status: 'active',
            type: 'public',
            player1Id: { $ne: null, $ne: userIdObj },
            player2Id: null
          },
          {
            $set: { player2Id: userIdObj }
          },
          {
            new: true,
            sort: { createdAt: 1 },
            session
          }
        );
      }

      if (!availableMatch) {
        throw new Error('No available matches found');
      }

      // Verify user has enough coins
      if (user.coins < availableMatch.cost) {
        // Rollback the match join
        const update = {};
        if (availableMatch.player1Id?.toString() === userId) {
          update.player1Id = null;
        } else if (availableMatch.player2Id?.toString() === userId) {
          update.player2Id = null;
        }
        await Match.findByIdAndUpdate(availableMatch._id, { $set: update }, { session });
        throw new Error(`Insufficient coins. You need ${availableMatch.cost} coins to join this match.`);
      }

      // Deduct coins atomically
      await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: -availableMatch.cost } },
        { session }
      );

      // Log transaction
      await Transaction.create([{
        userId: user._id,
        type: 'match_entry',
        amount: -availableMatch.cost,
        description: `Entry fee for match: ${availableMatch.name}`,
        matchId: availableMatch._id
      }], { session });
    });

    // After transaction, get the updated match with populated players
    const userId = req.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const joinedMatch = await Match.findOne({
      $or: [
        { player1Id: userIdObj },
        { player2Id: userIdObj }
      ]
    })
      .populate('player1Id', 'name email')
      .populate('player2Id', 'name email')
      .sort({ createdAt: -1 })
      .limit(1);

    if (!joinedMatch) {
      return res.status(404).json({
        success: false,
        message: 'Match not found after joining'
      });
    }

    res.json({
      success: true,
      message: 'Successfully joined match!',
      match: {
        id: joinedMatch._id.toString(),
        name: joinedMatch.name,
        type: joinedMatch.type,
        cost: joinedMatch.cost,
        prize: joinedMatch.prize,
        status: joinedMatch.status,
        player1Id: joinedMatch.player1Id?._id?.toString() || null,
        player2Id: joinedMatch.player2Id?._id?.toString() || null,
        player1Name: joinedMatch.player1Id?.name || null,
        player2Name: joinedMatch.player2Id?.name || null
      }
    });
  } catch (error) {
    logger.error('Auto-join match error:', error);
    const errorMessage = error.message || 'Server error while joining match';
    
    if (errorMessage === 'User not found') {
      return res.status(404).json({
        success: false,
        message: errorMessage
      });
    }
    
    if (errorMessage.includes('Insufficient coins')) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    if (errorMessage === 'No available matches found') {
      return res.status(404).json({
        success: false,
        message: 'No available matches found. Create a new match or wait for one to become available.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while joining match',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
    });
  } finally {
    await session.endSession();
  }
});

/**
 * @swagger
 * /api/matches/{id}/join:
 *   post:
 *     summary: Join a specific match
 *     description: Join a match by ID. Coins are automatically deducted. User must have sufficient coins.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to join the match
 *     responses:
 *       200:
 *         description: Successfully joined match
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
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Match full, insufficient coins, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Match or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Join match
router.post('/:id/join', [
  body('userId').notEmpty().withMessage('Valid user ID is required')
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
    const { userId } = req.body;

    // Get match
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (match.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Match is not active'
      });
    }

    // Check if user has enough coins
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.coins < match.cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient coins'
      });
    }

    // Check if match is full
    if (match.player1Id && match.player2Id) {
      return res.status(400).json({
        success: false,
        message: 'Match is full'
      });
    }

    // Check if user is already in match
    const userIdStr = userId.toString();
    if (match.player1Id?.toString() === userIdStr || match.player2Id?.toString() === userIdStr) {
      return res.status(400).json({
        success: false,
        message: 'User is already in this match'
      });
    }

    // Join match
    if (!match.player1Id) {
      match.player1Id = userId;
    } else {
      match.player2Id = userId;
    }
    await match.save();

    // Deduct coins
    user.coins -= match.cost;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      type: 'match_entry',
      amount: -match.cost,
      description: `Entry fee for match: ${match.name}`,
      matchId: match._id
    });

    res.json({
      success: true,
      message: 'Successfully joined match'
    });
  } catch (error) {
    logger.error('Join match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/matches/{id}/result:
 *   post:
 *     summary: Record match result (Admin only)
 *     description: Record the winner and loser of a match. Prize is automatically awarded to the winner. Only admins can record results.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winnerId
 *               - loserId
 *             properties:
 *               winnerId:
 *                 type: string
 *                 description: User ID of the winner
 *               loserId:
 *                 type: string
 *                 description: User ID of the loser
 *     responses:
 *       200:
 *         description: Match result recorded successfully
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
 *                   example: "Match result recorded successfully"
 *       400:
 *         description: Invalid players or match not active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Record match result (admin only)
router.post('/:id/result', requireAdmin, [
  body('winnerId').notEmpty().withMessage('Valid winner ID is required'),
  body('loserId').notEmpty().withMessage('Valid loser ID is required')
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
    const { winnerId, loserId } = req.body;

    // Get match
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (match.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Match is not active'
      });
    }

    // Verify players are in match
    const winnerIdStr = winnerId.toString();
    const loserIdStr = loserId.toString();
    const player1IdStr = match.player1Id?.toString();
    const player2IdStr = match.player2Id?.toString();

    if ((player1IdStr !== winnerIdStr && player1IdStr !== loserIdStr) ||
        (player2IdStr !== winnerIdStr && player2IdStr !== loserIdStr)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid players for this match'
      });
    }

    // Update match
    match.status = 'completed';
    match.winnerId = winnerId;
    match.completedAt = new Date();
    await match.save();

    // Update player stats
    await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
    await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });

    // Award prize to winner
    await User.findByIdAndUpdate(winnerId, { $inc: { coins: match.prize } });

    // Log transaction
    await Transaction.create({
      userId: winnerId,
      type: 'match_win',
      amount: match.prize,
      description: `Prize for winning match: ${match.name}`,
      matchId: match._id
    });

    res.json({
      success: true,
      message: 'Match result recorded successfully'
    });
  } catch (error) {
    logger.error('Record match result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
