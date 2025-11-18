import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationTokenExpiry: {
    type: Date,
    default: null
  },
  otpCode: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  coins: {
    type: Number,
    default: 0,
    min: 0
  },
  wins: {
    type: Number,
    default: 0,
    min: 0
  },
  losses: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationTokenExpiry;
      delete ret.otpCode;
      delete ret.otpExpiry;
      return ret;
    }
  }
});

// Indexes for performance (email already has unique index)
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, status: 1 }); // Compound index for common queries
userSchema.index({ createdAt: -1 }); // For sorting users by registration date

const User = mongoose.model('User', userSchema);

export default User;

