import mongoose from 'mongoose';

/**
 * Tournament Schema
 * Supports 4 and 8 player tournaments with automatic bracket generation
 */
const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    required: true
  },
  // Tournament configuration
  maxPlayers: {
    type: Number,
    enum: [4, 8],
    required: true
  },
  entryCost: {
    type: Number,
    required: true,
    min: 1
  },
  prizePool: {
    type: Number,
    required: true,
    min: 1
  },
  // Award percentage (default 80% to champion)
  awardPercentage: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  // Tournament status
  status: {
    type: String,
    enum: ['registration', 'active', 'completed', 'cancelled'],
    default: 'registration'
  },
  // Registered players
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Bracket structure (stores matches for each round)
  bracket: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Current round (1 = quarter/semi, 2 = semi/final, 3 = final)
  currentRound: {
    type: Number,
    default: 0
  },
  // Tournament winner
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Tournament completion
  completedAt: {
    type: Date,
    default: null
  },
  prizeDistributed: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient queries
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ createdAt: -1 });
tournamentSchema.index({ name: 1 }, { unique: true }); // Prevent duplicate tournament names

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;

