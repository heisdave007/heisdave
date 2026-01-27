import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use Gmail App Password, not regular password
  },
});

// Send verification email
export const sendVerificationEmail = async (email, token, name = 'User') => {
  try {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '✨ Verify Your Email - Dave\'s Fashion Hub',
      html: `
        <div style="font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">👗 Dave's Fashion Hub</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Welcome to Your Fashionable Journey!</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining Dave's Fashion Hub! To complete your registration and start shopping, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationURL}" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
                  ✨ Verify Email ✨
                </a>
              </div>

              <p style="color: #999; font-size: 13px; margin-top: 20px; text-align: center;">
                Or copy and paste this link:<br/>
                <span style="color: #666; word-break: break-all;">${verificationURL}</span>
              </p>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                This verification link will expire in <strong>24 hours</strong>.<br/>
                If you didn't create this account, please ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                &copy; 2024 Dave's Fashion Hub. All rights reserved.<br/>
                <a href="${process.env.FRONTEND_URL}" style="color: #ff6b9d; text-decoration: none;">Visit Our Store</a>
              </p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
  try {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Reset Your Password - Dave\'s Fashion Hub',
      html: `
        <div style="font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">👗 Dave's Fashion Hub</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Password Reset Request</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password. Click the button below to set a new password:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetURL}" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
                  🔐 Reset Password
                </a>
              </div>

              <p style="color: #999; font-size: 13px; margin-top: 20px; text-align: center;">
                Or copy and paste this link:<br/>
                <span style="color: #666; word-break: break-all;">${resetURL}</span>
              </p>

              <p style="color: #cc0000; font-size: 13px; margin-top: 30px;">
                ⚠️ This link will expire in <strong>1 hour</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                &copy; 2024 Dave's Fashion Hub. All rights reserved.<br/>
                <a href="${process.env.FRONTEND_URL}" style="color: #ff6b9d; text-decoration: none;">Visit Our Store</a>
              </p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name = 'User') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 Welcome to Dave\'s Fashion Hub!',
      html: `
        <div style="font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">👗 Dave's Fashion Hub</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Welcome Aboard, Fashionista!</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                🎊 Welcome to Dave's Fashion Hub! Your account has been successfully created. You're now part of our fashionable community!
              </p>

              <!-- Benefits -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">What you get:</h3>
                <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                  <li>✓ Exclusive access to premium fashion items</li>
                  <li>✓ Early access to new collections</li>
                  <li>✓ Special discounts and offers</li>
                  <li>✓ Free shipping on orders over $50</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/home.html" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                  🛍️ Start Shopping
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                &copy; 2024 Dave's Fashion Hub. All rights reserved.<br/>
                <a href="${process.env.FRONTEND_URL}" style="color: #ff6b9d; text-decoration: none;">Visit Our Store</a>
              </p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

export default transporter;
