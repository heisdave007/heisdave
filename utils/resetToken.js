import crypto from 'crypto';

// Generate a random reset token
export const generateResetToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hashedToken };
};

export default generateResetToken;
