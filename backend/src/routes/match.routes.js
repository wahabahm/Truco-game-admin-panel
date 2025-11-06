import express from 'express';
import { body, validationResult } from 'express-validator';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Get single match by ID
 */
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
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Auto-matchmaking: Automatically find and join an available match
 * Finds first available active match and joins it
 */
router.post('/auto-join', async (req, res) => {
  try {
    const userId = req.user.id;

    // Find available matches (active, not full, public)
    const availableMatch = await Match.findOne({
      status: 'active',
      type: 'public',
      $or: [
        { player1Id: null },
        { player2Id: null }
      ]
    }).sort({ createdAt: 1 }); // Oldest first

    if (!availableMatch) {
      return res.status(404).json({
        success: false,
        message: 'No available matches found. Create a new match or wait for one to become available.'
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

    if (user.coins < availableMatch.cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins. You need ${availableMatch.cost} coins to join this match.`
      });
    }

    // Check if user is already in this match
    const userIdStr = userId.toString();
    if (availableMatch.player1Id?.toString() === userIdStr || availableMatch.player2Id?.toString() === userIdStr) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this match'
      });
    }

    // Check if match is full (double check)
    if (availableMatch.player1Id && availableMatch.player2Id) {
      return res.status(400).json({
        success: false,
        message: 'Match is full'
      });
    }

    // Join match
    if (!availableMatch.player1Id) {
      availableMatch.player1Id = userId;
    } else {
      availableMatch.player2Id = userId;
    }
    await availableMatch.save();

    // Deduct coins
    user.coins -= availableMatch.cost;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      type: 'match_entry',
      amount: -availableMatch.cost,
      description: `Entry fee for match: ${availableMatch.name}`,
      matchId: availableMatch._id
    });

    // Populate match data for response
    await availableMatch.populate('player1Id', 'name email');
    await availableMatch.populate('player2Id', 'name email');

    res.json({
      success: true,
      message: 'Successfully joined match!',
      match: {
        id: availableMatch._id.toString(),
        name: availableMatch.name,
        type: availableMatch.type,
        cost: availableMatch.cost,
        prize: availableMatch.prize,
        status: availableMatch.status,
        player1Id: availableMatch.player1Id?._id?.toString() || null,
        player2Id: availableMatch.player2Id?._id?.toString() || null,
        player1Name: availableMatch.player1Id?.name || null,
        player2Name: availableMatch.player2Id?.name || null
      }
    });
  } catch (error) {
    console.error('Auto-join match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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
    console.error('Join match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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
    console.error('Record match result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
