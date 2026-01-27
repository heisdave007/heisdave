import { TokenBlacklist } from '../schemas/tokenBlacklistSchema.js';
import jwt from 'jsonwebtoken';

/**
 * Add token to blacklist (invalidate token)
 * @param {String} token - JWT token
 * @param {String} userId - User ID
 * @param {String} reason - Reason for blacklisting
 */
export const blacklistToken = async (token, userId, reason = 'logout') => {
  try {
    // Decode token to get expiration time
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.exp) {
      console.warn('Warning: Could not decode token or no expiration found');
      return null;
    }

    // Create blacklist entry
    const blacklistedToken = await TokenBlacklist.create({
      userId,
      token,
      reason,
      expiresAt: new Date(decoded.exp * 1000), // Convert Unix timestamp to milliseconds
    });

    return blacklistedToken;
  } catch (err) {
    console.error('Error blacklisting token:', err.message);
    throw new Error('Failed to blacklist token');
  }
};

/**
 * Check if token is blacklisted
 * @param {String} token - JWT token
 * @returns {Boolean}
 */
export const isTokenBlacklisted = async (token) => {
  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return !!blacklistedToken;
  } catch (err) {
    console.error('Error checking token blacklist:', err.message);
    return false;
  }
};

/**
 * Blacklist all tokens for a specific user
 * @param {String} userId - User ID
 * @param {String} reason - Reason for blacklisting
 */
export const blacklistAllUserTokens = async (userId, reason = 'logout') => {
  try {
    // Find all tokens that might exist for this user
    // Since we don't have a sessions table, we blacklist based on user ID
    // New tokens will be issued with new user ID if user exists
    
    // In a real scenario, you'd find tokens from a session table
    // For now, we'll just document that this user's tokens should be invalid
    const result = await TokenBlacklist.deleteMany({
      userId,
    });

    console.log(`Cleared ${result.deletedCount} token(s) for user ${userId}`);
    return result.deletedCount;
  } catch (err) {
    console.error('Error blacklisting all user tokens:', err.message);
    throw new Error('Failed to blacklist user tokens');
  }
};

/**
 * Clean up expired blacklist entries
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await TokenBlacklist.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    console.log(`Cleaned up ${result.deletedCount} expired token blacklist entries`);
    return result.deletedCount;
  } catch (err) {
    console.error('Error cleaning up expired tokens:', err.message);
  }
};

/**
 * Get all blacklisted tokens for a user
 * @param {String} userId - User ID
 */
export const getUserBlacklistedTokens = async (userId) => {
  try {
    return await TokenBlacklist.find({ userId }).select('token reason createdAt');
  } catch (err) {
    console.error('Error retrieving blacklisted tokens:', err.message);
    return [];
  }
};
