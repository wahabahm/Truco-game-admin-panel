import express from 'express';
import { body, validationResult } from 'express-validator';
import Tournament from '../models/Tournament.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Transaction from '../models/Transaction.js';
import { generateBracket, progressToNextRound } from '../utils/bracketGenerator.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get all tournaments
 * Supports filtering by status
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const tournaments = await Tournament.find(query)
      .populate('participants', 'name email')
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const formattedTournaments = tournaments.map(tournament => ({
      id: tournament._id.toString(),
      name: tournament.name,
      type: tournament.type,
      maxPlayers: tournament.maxPlayers,
      entryCost: tournament.entryCost,
      prizePool: tournament.prizePool,
      startDate: tournament.startDate,
      status: tournament.status,
      participants: tournament.participants?.map(p => ({
        id: p._id?.toString() || p.toString(),
        name: p.name || 'Unknown',
        email: p.email || 'Unknown'
      })) || [],
      participantCount: tournament.participants?.length || 0,
      currentRound: tournament.currentRound,
      winnerId: tournament.winnerId?._id?.toString() || tournament.winnerId?.toString() || null,
      winnerName: tournament.winnerId?.name || null,
      completedAt: tournament.completedAt,
      cancelledAt: tournament.cancelledAt,
      cancellationReason: tournament.cancellationReason,
      createdAt: tournament.createdAt
    }));

    res.json({
      success: true,
      tournaments: formattedTournaments
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Get tournament by ID with full bracket details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id)
      .populate('participants', 'name email coins')
      .populate('winnerId', 'name email')
      .lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      tournament: {
        id: tournament._id.toString(),
        name: tournament.name,
        type: tournament.type,
        maxPlayers: tournament.maxPlayers,
        entryCost: tournament.entryCost,
        prizePool: tournament.prizePool,
        startDate: tournament.startDate,
        status: tournament.status,
        participants: tournament.participants?.map(p => ({
          id: p._id?.toString() || p.toString(),
          name: p.name || 'Unknown',
          email: p.email || 'Unknown'
        })) || [],
        participantCount: tournament.participants?.length || 0,
        bracket: tournament.bracket,
        currentRound: tournament.currentRound,
        winnerId: tournament.winnerId?._id?.toString() || tournament.winnerId?.toString() || null,
        winnerName: tournament.winnerId?.name || null,
        completedAt: tournament.completedAt,
        createdAt: tournament.createdAt
      }
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Get tournament players list
 */
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id)
      .populate('participants', 'name email coins wins losses status')
      .lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      players: tournament.participants?.map(p => ({
        id: p._id?.toString() || p.toString(),
        name: p.name || 'Unknown',
        email: p.email || 'Unknown',
        coins: p.coins || 0,
        wins: p.wins || 0,
        losses: p.losses || 0,
        status: p.status || 'active'
      })) || [],
      totalPlayers: tournament.participants?.length || 0,
      maxPlayers: tournament.maxPlayers
    });
  } catch (error) {
    console.error('Get tournament players error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Create tournament (Admin only)
 * Validates duplicate tournament names
 */
router.post('/', requireAdmin, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('type').isIn(['public', 'private']).withMessage('Type must be public or private'),
  body('maxPlayers').isIn([4, 8]).withMessage('Max players must be 4 or 8'),
  body('entryCost').isInt({ min: 1 }).withMessage('Entry cost must be a positive integer'),
  body('prizePool').isInt({ min: 1 }).withMessage('Prize pool must be a positive integer'),
  body('startDate').optional().isISO8601().withMessage('Invalid date format')
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

    const { name, type, maxPlayers, entryCost, prizePool, startDate } = req.body;

    // Check for duplicate tournament name (server-side validation)
    const existingTournament = await Tournament.findOne({ name: name.trim() });
    if (existingTournament) {
      return res.status(400).json({
        success: false,
        message: 'Tournament with this name already exists'
      });
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      type,
      maxPlayers: parseInt(maxPlayers),
      entryCost: parseInt(entryCost),
      prizePool: parseInt(prizePool),
      startDate: startDate || null,
      status: 'registration'
    });

    res.status(201).json({
      success: true,
      tournament: {
        id: tournament._id.toString(),
        name: tournament.name,
        type: tournament.type,
        maxPlayers: tournament.maxPlayers,
        entryCost: tournament.entryCost,
        prizePool: tournament.prizePool,
        startDate: tournament.startDate,
        status: tournament.status,
        participantCount: 0,
        createdAt: tournament.createdAt
      }
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tournament with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Join tournament
 * Validates sufficient coins and prevents duplicate registration
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get tournament
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Validation: Check tournament status
    if (tournament.status !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not accepting registrations'
      });
    }

    // Validation: Check if tournament is full
    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Validation: Check if user is already registered
    const userIdObj = typeof userId === 'string' ? userId : userId.toString();
    if (tournament.participants.some(p => p.toString() === userIdObj)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this tournament'
      });
    }

    // Validation: Check user has sufficient coins (server-side validation)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.coins < tournament.entryCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient coins'
      });
    }

    // Deduct coins (server-side to prevent manipulation)
    user.coins -= tournament.entryCost;
    await user.save();

    // Add user to tournament
    tournament.participants.push(userId);
    
    // If tournament is now full, generate bracket and start
    if (tournament.participants.length === tournament.maxPlayers) {
      const bracket = generateBracket(tournament.maxPlayers, tournament.participants);
      tournament.bracket = bracket;
      tournament.status = 'active';
      tournament.currentRound = 1;
    }

    await tournament.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      type: 'tournament_entry',
      amount: -tournament.entryCost,
      description: `Entry fee for tournament: ${tournament.name}`,
      matchId: null
    });

    res.json({
      success: true,
      message: tournament.participants.length === tournament.maxPlayers 
        ? 'Tournament is now full and has started!' 
        : 'Successfully joined tournament',
      tournament: {
        id: tournament._id.toString(),
        participantCount: tournament.participants.length,
        status: tournament.status
      }
    });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Record match result in tournament (Admin only)
 * Automatically progresses to next round and distributes prizes
 */
router.post('/:id/record-match', requireAdmin, [
  body('roundNumber').isInt({ min: 1 }).withMessage('Round number is required'),
  body('matchIndex').isInt({ min: 0 }).withMessage('Match index is required'),
  body('winnerId').notEmpty().withMessage('Winner ID is required')
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
    const { roundNumber, matchIndex, winnerId } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not active'
      });
    }

    // Update match result in bracket
    const bracket = tournament.bracket;
    const round = bracket.rounds.find(r => r.roundNumber === roundNumber);
    if (!round || !round.matches[matchIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round or match'
      });
    }

    const match = round.matches[matchIndex];
    match.winnerId = winnerId;
    match.status = 'completed';

    // Check if all matches in current round are completed
    const allMatchesCompleted = round.matches.every(m => m.status === 'completed');
    
    if (allMatchesCompleted) {
      // Get winners from this round
      const winners = round.matches.map(m => m.winnerId);
      
      // Check if this was the final round
      if (roundNumber === bracket.totalRounds) {
        // Tournament completed
        const champion = winners[0];
        tournament.winnerId = champion;
        tournament.status = 'completed';
        tournament.completedAt = new Date();
        tournament.currentRound = roundNumber;

        // Distribute prize (use awardPercentage, default 80%)
        const awardPercentage = tournament.awardPercentage || 80;
        const prizeAmount = Math.floor(tournament.prizePool * (awardPercentage / 100));
        await User.findByIdAndUpdate(champion, { $inc: { coins: prizeAmount } });
        await User.findByIdAndUpdate(champion, { $inc: { wins: 1 } });

        // Log transaction
        await Transaction.create({
          userId: champion,
          type: 'tournament_win',
          amount: prizeAmount,
          description: `Tournament prize (${awardPercentage}%) for winning: ${tournament.name}`,
          matchId: null
        });
      } else {
        // Progress to next round
        tournament.bracket = progressToNextRound(bracket, roundNumber, winners);
        tournament.currentRound = roundNumber + 1;
      }
    }

    await tournament.save();

    res.json({
      success: true,
      message: tournament.status === 'completed' 
        ? 'Tournament completed! Prize distributed to champion.' 
        : 'Match result recorded. Tournament progressed to next round.',
      tournament: {
        id: tournament._id.toString(),
        status: tournament.status,
        currentRound: tournament.currentRound,
        winnerId: tournament.winnerId?.toString() || null
      }
    });
  } catch (error) {
    console.error('Record tournament match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Update tournament award percentage (Admin only)
 * Allows changing prize distribution percentage (default 80%)
 */
router.post('/:id/update-award-percentage', requireAdmin, [
  body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100')
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
    const { percentage } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update award percentage for completed tournament'
      });
    }

    // Store award percentage in tournament (add to schema if needed)
    // For now, we'll store it in a custom field
    tournament.awardPercentage = parseFloat(percentage);
    await tournament.save();

    res.json({
      success: true,
      message: `Award percentage updated to ${percentage}%`,
      tournament: {
        id: tournament._id.toString(),
        awardPercentage: tournament.awardPercentage
      }
    });
  } catch (error) {
    console.error('Update award percentage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Cancel tournament and refund all participants (Admin only)
 */
router.post('/:id/cancel', requireAdmin, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed tournament'
      });
    }

    if (tournament.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Tournament is already cancelled'
      });
    }

    // Refund all participants
    for (const participantId of tournament.participants) {
      const user = await User.findById(participantId);
      if (user) {
        user.coins += tournament.entryCost;
        await user.save();

        // Log refund transaction
        await Transaction.create({
          userId: user._id,
          type: 'tournament_entry',
          amount: tournament.entryCost,
          description: `Refund for cancelled tournament: ${tournament.name}`,
          matchId: null
        });
      }
    }

    // Update tournament status
    tournament.status = 'cancelled';
    tournament.cancelledAt = new Date();
    tournament.cancellationReason = reason || 'Cancelled by admin';
    await tournament.save();

    res.json({
      success: true,
      message: 'Tournament cancelled. All participants have been refunded.',
      refundedCount: tournament.participants.length
    });
  } catch (error) {
    console.error('Cancel tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

