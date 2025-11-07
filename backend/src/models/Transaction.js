import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['match_entry', 'match_win', 'tournament_entry', 'tournament_win', 'coin_purchase', 'admin_add', 'admin_remove'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
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

// Indexes for performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 }); // For user transaction history
transactionSchema.index({ userId: 1, type: 1 }); // For filtering user transactions by type
transactionSchema.index({ matchId: 1 }); // For match-related transactions

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;


