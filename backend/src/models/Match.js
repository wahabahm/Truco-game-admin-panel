import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 1
  },
  prize: {
    type: Number,
    required: true,
    min: 1
  },
  matchDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completedAt: {
    type: Date,
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

// Indexes
matchSchema.index({ status: 1 });
matchSchema.index({ createdAt: -1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;


