import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Transaction from '../models/Transaction.js';
import { generateBracket, progressToNextRound } from '../utils/bracketGenerator.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { transformTournamentToDto, transformUserToDto, transformMatchToDto } from '../utils/dtoTransformers.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     description: Retrieve a list of all tournaments with optional status filtering
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registration, active, completed, cancelled]
 *         description: Filter tournaments by status
 *     responses:
 *       200:
 *         description: List of tournaments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tournaments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tournament'
 */
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
      .populate('participants')
      .populate('winnerId')
      .sort({ createdAt: -1 })
      .lean();

    // Transform to TournamentDto format
    const formattedTournaments = await Promise.all(
      tournaments.map(tournament => transformTournamentToDto(tournament, Match, User))
    );

    res.json({
      success: true,
      tournaments: formattedTournaments
    });
  } catch (error) {
    logger.error('Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/export:
 *   get:
 *     summary: Export tournaments (Admin only)
 *     description: Export tournament history as CSV or JSON
 *     tags: [Tournaments]
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
 *           enum: [registration, active, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Tournament export file
 *       403:
 *         description: Admin access required
 */
/**
 * Export tournaments (Admin only)
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

    // Fetch tournaments with populated data
    const tournaments = await Tournament.find(query)
      .populate('participants', 'name email')
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'json') {
      // JSON export
      const exportData = tournaments.map(tournament => ({
        _id: tournament._id.toString(),
        name: tournament.name,
        type: tournament.type,
        maxPlayers: tournament.maxPlayers,
        entryCost: tournament.entryCost,
        prizePool: tournament.prizePool,
        awardPercentage: tournament.awardPercentage || 80,
        startDate: tournament.startDate || null,
        status: tournament.status,
        participantCount: tournament.participants?.length || 0,
        participants: tournament.participants?.map(p => ({
          _id: p._id?.toString() || p.toString(),
          username: p.name || p.username || 'Unknown',
          email: p.email || 'Unknown'
        })) || [],
        currentRound: tournament.currentRound,
        winnerId: tournament.winnerId?._id?.toString() || tournament.winnerId?.toString() || null,
        winnerName: tournament.winnerId?.name || tournament.winnerId?.username || null,
        completedAt: tournament.completedAt || null,
        cancelledAt: tournament.cancelledAt || null,
        cancellationReason: tournament.cancellationReason || null,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=tournaments_${new Date().toISOString().split('T')[0]}.json`);
      res.json({ tournaments: exportData });
    } else {
      // CSV export
      const csvHeaders = [
        'ID',
        'Name',
        'Type',
        'Max Players',
        'Entry Cost',
        'Prize Pool',
        'Award Percentage',
        'Start Date',
        'Status',
        'Participant Count',
        'Participants',
        'Current Round',
        'Winner',
        'Completed At',
        'Cancelled At',
        'Cancellation Reason',
        'Created At'
      ];

      const csvRows = tournaments.map(tournament => {
        const participants = tournament.participants?.map(p => 
          `${p.name || p.username || 'Unknown'} (${p.email || 'N/A'})`
        ).join('; ') || 'None';

        return [
          tournament._id.toString(),
          `"${tournament.name || ''}"`,
          tournament.type || '',
          tournament.maxPlayers || 0,
          tournament.entryCost || 0,
          tournament.prizePool || 0,
          tournament.awardPercentage || 80,
          tournament.startDate ? new Date(tournament.startDate).toISOString() : '',
          tournament.status || '',
          tournament.participants?.length || 0,
          `"${participants}"`,
          tournament.currentRound || 0,
          tournament.winnerId?.name || tournament.winnerId?.username || tournament.winnerId?.email || '',
          tournament.completedAt ? new Date(tournament.completedAt).toISOString() : '',
          tournament.cancelledAt ? new Date(tournament.cancelledAt).toISOString() : '',
          `"${tournament.cancellationReason || ''}"`,
          tournament.createdAt ? new Date(tournament.createdAt).toISOString() : ''
        ].join(',');
      });

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=tournaments_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    }
  } catch (error) {
    logger.error('Export tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     description: Retrieve a specific tournament with full bracket details
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tournament:
 *                   $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournament not found
 */
/**
 * Get tournament by ID with full bracket details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id)
      .populate('participants')
      .populate('winnerId')
      .lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Transform to TournamentDto format
    const tournamentDto = await transformTournamentToDto(tournament, Match, User);

    res.json({
      success: true,
      tournament: tournamentDto
    });
  } catch (error) {
    logger.error('Get tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/players:
 *   get:
 *     summary: Get tournament players
 *     description: Retrieve list of all players registered in a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament players retrieved successfully
 *       404:
 *         description: Tournament not found
 */
/**
 * Get tournament players list
 */
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id)
      .populate('participants')
      .lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Transform players to UserDto format
    const players = tournament.participants?.map(p => transformUserToDto(p)) || [];

    res.json({
      success: true,
      players: players,
      totalPlayers: players.length,
      maxPlayers: tournament.maxPlayers
    });
  } catch (error) {
    logger.error('Get tournament players error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create tournament (Admin only)
 *     description: Create a new tournament. Validates duplicate tournament names.
 *     tags: [Tournaments]
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
 *               - maxPlayers
 *               - entryCost
 *               - prizePool
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: Spring Championship
 *               type:
 *                 type: string
 *                 enum: [public, private]
 *                 example: public
 *               maxPlayers:
 *                 type: integer
 *                 enum: [4, 8]
 *                 example: 8
 *               entryCost:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               prizePool:
 *                 type: integer
 *                 minimum: 1
 *                 example: 800
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-03-15T10:00:00Z
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *       400:
 *         description: Validation error or duplicate tournament name
 *       403:
 *         description: Admin access required
 */
/**
 * Create tournament (Admin only)
 * Validates duplicate tournament names
 */
router.post('/', requireAdmin, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('description').optional().trim(),
  body('type').isIn(['public', 'private']).withMessage('Type must be public or private'),
  body('maxPlayers').isIn([4, 8]).withMessage('Max players must be 4 or 8'),
  body('entryCost').isInt({ min: 1 }).withMessage('Entry cost must be a positive integer'),
  body('prizePool').isInt({ min: 1 }).withMessage('Prize pool must be a positive integer'),
  body('startDate').optional().isISO8601().withMessage('Invalid date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid date format')
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

    const { name, description, type, maxPlayers, entryCost, prizePool, startDate, endDate } = req.body;

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
      description: description || '',
      type,
      maxPlayers: parseInt(maxPlayers),
      entryCost: parseInt(entryCost),
      prizePool: parseInt(prizePool),
      startDate: startDate || null,
      endDate: endDate || null,
      status: 'registration'
    });

    // Transform to TournamentDto format
    const tournamentDto = await transformTournamentToDto(tournament.toObject(), Match, User);

    res.status(201).json({
      success: true,
      data: tournamentDto
    });
  } catch (error) {
    logger.error('Create tournament error:', error);
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
 * @swagger
 * /api/tournaments/{id}/join:
 *   post:
 *     summary: Join tournament
 *     description: Register the current user for a tournament. Validates sufficient coins and prevents duplicate registration.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Successfully joined tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 coins:
 *                   type: integer
 *                   description: Remaining coins after joining tournament
 *                   example: 900
 *       400:
 *         description: Tournament full, insufficient coins, or already registered
 *       404:
 *         description: Tournament not found
 */
/**
 * Join tournament
 * Validates sufficient coins and prevents duplicate registration
 * Uses MongoDB transactions to prevent race conditions
 */
router.post('/:id/join', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await session.withTransaction(async () => {

      // Get tournament with session for transaction
      const tournament = await Tournament.findById(id).session(session);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Validation: Check tournament status
      if (tournament.status !== 'registration') {
        throw new Error('Tournament is not accepting registrations');
      }

      // Validation: Check if tournament is full (atomic check)
      if (tournament.participants.length >= tournament.maxPlayers) {
        throw new Error('Tournament is full');
      }

      // Validation: Check if user is already registered
      const userIdObj = typeof userId === 'string' ? userId : userId.toString();
      if (tournament.participants.some(p => p.toString() === userIdObj)) {
        throw new Error('You are already registered for this tournament');
      }

      // Validation: Check user has sufficient coins (server-side validation)
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.coins < tournament.entryCost) {
        throw new Error('Insufficient coins');
      }

      // Track balance before transaction
      const balanceBefore = user.coins;
      const balanceAfter = balanceBefore - tournament.entryCost;

      // Deduct coins (atomic operation)
      await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: -tournament.entryCost } },
        { session }
      );

      // Add user to tournament (atomic operation)
      tournament.participants.push(userId);
      
      // If tournament is now full, generate bracket and start
      if (tournament.participants.length === tournament.maxPlayers) {
        const bracket = generateBracket(tournament.maxPlayers, tournament.participants);
        tournament.bracket = bracket;
        tournament.status = 'active';
        tournament.currentRound = 1;
      }

      await tournament.save({ session });

      // Log transaction with balance tracking
      await Transaction.create([{
        userId: user._id,
        type: 'tournament_entry',
        amount: -tournament.entryCost,
        description: `Entry fee for tournament: ${tournament.name}`,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        matchId: null
      }], { session });
    });

    // After transaction, get updated user and tournament
    const tournament = await Tournament.findById(id);
    const updatedUser = await User.findById(userId).select('coins');
    
    // Return EnterTournamentResponse format matching C# structure
    res.json({
      ok: true,
      coins: updatedUser.coins || 0
    });
  } catch (error) {
    logger.error('Join tournament error:', error);
    const errorMessage = error.message || 'Server error';
    
    if (errorMessage === 'Tournament not found') {
      return res.status(404).json({
        success: false,
        message: errorMessage
      });
    }
    
    if (errorMessage.includes('Tournament is full') || 
        errorMessage.includes('already registered') ||
        errorMessage.includes('Insufficient coins') ||
        errorMessage.includes('not accepting registrations')) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    await session.endSession();
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/create-match:
 *   post:
 *     summary: Create a match in tournament
 *     description: Create a match within a tournament with specified participants
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of participant user IDs (typically 2 for a match)
 *                 example: ["user_id_1", "user_id_2"]
 *     responses:
 *       200:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Validation error or invalid participants
 *       404:
 *         description: Tournament not found
 */
// Create tournament match
router.post('/:id/create-match', [
  body('participants').isArray({ min: 1 }).withMessage('Participants array is required'),
  body('participants.*').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Each participant must be a valid user ID');
    }
    return true;
  })
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
    const { participants } = req.body;

    // Find tournament
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Validate participants (should be 2 for a match)
    if (participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'A match requires exactly 2 participants'
      });
    }

    // Convert participants to ObjectIds
    const participantObjectIds = participants.map(pId => new mongoose.Types.ObjectId(pId));

    // Validate participants exist and are in tournament
    const participantUsers = await User.find({ _id: { $in: participantObjectIds } });
    if (participantUsers.length !== participants.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants not found'
      });
    }

    // Check if participants are in tournament
    const tournamentParticipantIds = tournament.participants.map(p => p.toString());
    const allParticipantsInTournament = participantObjectIds.every(pId => 
      tournamentParticipantIds.includes(pId.toString())
    );

    if (!allParticipantsInTournament) {
      return res.status(400).json({
        success: false,
        message: 'All participants must be registered in the tournament'
      });
    }

    // Create match linked to tournament
    const match = await Match.create({
      name: `Match: ${tournament.name}`,
      type: 'private', // Tournament matches are typically private
      cost: 0, // Tournament matches don't have entry fee
      prize: 0, // Prize will be determined by tournament
      tournamentId: tournament._id,
      player1Id: participantObjectIds[0],
      player2Id: participantObjectIds[1],
      status: 'active'
    });

    // Populate match with players and tournament for DTO transformation
    const populatedMatch = await Match.findById(match._id)
      .populate('player1Id')
      .populate('player2Id')
      .populate('tournamentId')
      .lean();

    // Transform to MatchDto format
    const matchDto = transformMatchToDto(populatedMatch, Tournament, User);

    // Return CreateTournamentMatchResponse format matching C# structure
    res.json({
      ok: true,
      match: matchDto
    });
  } catch (error) {
    logger.error('Create tournament match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/finalize-match:
 *   post:
 *     summary: Finalize a tournament match
 *     description: Finalize a specific match in a tournament by setting the winner. Updates match status, player stats, and awards prize.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - winnerId
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: Match ID to finalize
 *                 example: "match_id_here"
 *               winnerId:
 *                 type: string
 *                 description: User ID of the match winner
 *                 example: "user_id_here"
 *     responses:
 *       200:
 *         description: Match finalized successfully
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
 *                   example: "Match finalized successfully"
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Validation error, match not found, or invalid winner
 *       404:
 *         description: Tournament or match not found
 */
// Finalize tournament match
router.post('/:id/finalize-match', [
  body('matchId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Match ID must be a valid ID');
    }
    return true;
  }),
  body('winnerId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Winner ID must be a valid user ID');
    }
    return true;
  })
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
    const { matchId, winnerId } = req.body;

    // Find tournament
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Find match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Validate match belongs to tournament
    if (!match.tournamentId || match.tournamentId.toString() !== tournament._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Match does not belong to this tournament'
      });
    }

    // Check if match is already completed
    if (match.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Match is already finalized'
      });
    }

    // Validate winner is one of the match players
    const winnerIdStr = winnerId.toString();
    const player1IdStr = match.player1Id?.toString();
    const player2IdStr = match.player2Id?.toString();

    if (player1IdStr !== winnerIdStr && player2IdStr !== winnerIdStr) {
      return res.status(400).json({
        success: false,
        message: 'Winner must be one of the match players'
      });
    }

    // Determine loser
    const loserId = player1IdStr === winnerIdStr ? match.player2Id : match.player1Id;

    // Update match
    match.status = 'completed';
    match.winnerId = winnerId;
    match.completedAt = new Date();
    await match.save();

    // Get winner's balance before prize
    const winnerUser = await User.findById(winnerId);
    const balanceBefore = winnerUser ? winnerUser.coins : 0;
    const balanceAfter = balanceBefore + (match.prize || 0);

    // Update player stats and award prize
    if (winnerUser) {
      await User.findByIdAndUpdate(winnerId, { 
        $inc: { wins: 1, coins: match.prize || 0 } 
      });
    }

    if (loserId) {
      await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
    }

    // Log transaction if prize exists
    if (match.prize && match.prize > 0 && winnerUser) {
      await Transaction.create({
        userId: winnerId,
        type: 'match_win',
        amount: match.prize,
        description: `Prize for winning tournament match: ${match.name}`,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        matchId: match._id
      });
    }

    // Populate match for DTO transformation
    const populatedMatch = await Match.findById(match._id)
      .populate('player1Id')
      .populate('player2Id')
      .populate('tournamentId')
      .populate('winnerId');

    // Transform to MatchDto format
    const matchDto = transformMatchToDto(populatedMatch, Tournament, User);

    res.json({
      success: true,
      message: 'Match finalized successfully',
      match: matchDto
    });
  } catch (error) {
    logger.error('Finalize tournament match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/finalize:
 *   post:
 *     summary: Finalize tournament champion
 *     description: Set the tournament champion and complete the tournament. Prize will be distributed if not already distributed.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - championId
 *             properties:
 *               championId:
 *                 type: string
 *                 description: User ID of the tournament champion
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tournament finalized successfully
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
 *                   example: Tournament finalized successfully
 *                 tournament:
 *                   $ref: '#/components/schemas/Tournament'
 *       400:
 *         description: Validation error or champion not in tournament
 *       404:
 *         description: Tournament or champion not found
 */
// Finalize tournament champion
router.post('/:id/finalize', [
  body('championId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Champion ID must be a valid user ID');
    }
    return true;
  })
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
    const { championId } = req.body;

    // Find tournament
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if tournament is already completed
    if (tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Tournament is already completed'
      });
    }

    // Validate champion exists
    const championUser = await User.findById(championId);
    if (!championUser) {
      return res.status(404).json({
        success: false,
        message: 'Champion not found'
      });
    }

    // Validate champion is in tournament
    const tournamentParticipantIds = tournament.participants.map(p => p.toString());
    if (!tournamentParticipantIds.includes(championId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Champion must be a participant in the tournament'
      });
    }

    // Set champion and complete tournament
    tournament.winnerId = new mongoose.Types.ObjectId(championId);
    tournament.status = 'completed';
    tournament.completedAt = new Date();

    // Distribute prize if not already distributed
    if (!tournament.prizeDistributed) {
      const awardPercentage = tournament.awardPercentage || 80;
      const prizeAmount = Math.floor(tournament.prizePool * (awardPercentage / 100));
      
      // Get user's current balance before transaction
      const balanceBefore = championUser.coins;
      const balanceAfter = balanceBefore + prizeAmount;
      
      await User.findByIdAndUpdate(championId, { $inc: { coins: prizeAmount } });

      // Mark prize as distributed
      tournament.prizeDistributed = true;

      // Log transaction with balance tracking
      await Transaction.create({
        userId: championId,
        type: 'tournament_win',
        amount: prizeAmount,
        description: `Tournament prize (${awardPercentage}%) for winning: ${tournament.name}`,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        matchId: null
      });
    }

    await tournament.save();

    // Populate tournament for DTO transformation
    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('participants')
      .populate('winnerId')
      .lean();

    // Transform to TournamentDto format
    const tournamentDto = await transformTournamentToDto(populatedTournament, Match, User);

    res.json({
      success: true,
      message: 'Tournament finalized successfully',
      tournament: tournamentDto
    });
  } catch (error) {
    logger.error('Finalize tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/update-award-percentage:
 *   post:
 *     summary: Update tournament award percentage (Admin only)
 *     description: Change the prize distribution percentage for a tournament (default 80%)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - percentage
 *             properties:
 *               percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 80
 *     responses:
 *       200:
 *         description: Award percentage updated successfully
 *       400:
 *         description: Validation error or tournament already completed
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Tournament not found
 */
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
    logger.error('Update award percentage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/cancel:
 *   post:
 *     summary: Cancel tournament (Admin only)
 *     description: Cancel a tournament and refund all participants their entry fees
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Technical issues
 *     responses:
 *       200:
 *         description: Tournament cancelled and participants refunded
 *       400:
 *         description: Tournament already completed or cancelled
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Tournament not found
 */
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

    // Refund all participants (use atomic operations)
    for (const participantId of tournament.participants) {
      const user = await User.findById(participantId);
      if (user) {
        // Get balance before refund
        const balanceBefore = user.coins;
        const balanceAfter = balanceBefore + tournament.entryCost;

        // Atomically refund coins
        await User.findByIdAndUpdate(
          participantId,
          { $inc: { coins: tournament.entryCost } }
        );

        // Log refund transaction with balance tracking
        await Transaction.create({
          userId: user._id,
          type: 'tournament_entry',
          amount: tournament.entryCost,
          description: `Refund for cancelled tournament: ${tournament.name}`,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
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
    logger.error('Cancel tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

