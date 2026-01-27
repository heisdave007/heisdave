import crypto from 'crypto';
import { User } from '../schemas/userSchema.js';

// Middleware to verify reset token validity
export const verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Hash the token to match the one in the database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Token is valid, proceed
        req.resetToken = token;
        req.hashedToken = hashedToken;
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

export default verifyResetToken;
