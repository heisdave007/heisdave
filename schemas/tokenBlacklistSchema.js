import mongoose from 'mongoose';

// Token Blacklist Schema - stores invalidated tokens
const TokenBlacklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['user_deleted', 'logout', 'user_not_found', 'password_changed'],
      default: 'logout',
    },
    expiresAt: {
      type: Date,
      required: true,
      // Auto-delete documents after expiration using TTL index
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index to auto-delete expired tokens
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model('TokenBlacklist', TokenBlacklistSchema);
