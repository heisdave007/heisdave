import jwt from "jsonwebtoken";
import { User } from "../schemas/userSchema.js";
import signToken from "../utils/jwauthentication.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { generateResetToken } from "../utils/resetToken.js";
import { blacklistToken, isTokenBlacklisted, blacklistAllUserTokens } from "../utils/tokenBlacklist.js";
import crypto from "crypto";
import util from "util";


// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const findUser = await User.find({});
    return res.status(200).json(findUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await User.findById(id);

    if (!findUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(findUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(204).json({ message: "user deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    // Validate required fields
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, email, password, and confirmPassword" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const userExist = await User.exists({ email });

    if (userExist)
      return res.status(409).json({ message: "User already exists" });

    // Generate email verification token BEFORE creating user
    const { token, hashedToken } = generateResetToken();

    // Prepare user data with email verification token
    const userData = {
      ...req.body,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Create new user
    let newUser;
    try {
      newUser = await User.create(userData);
    } catch (createErr) {
      console.error('User creation error:', createErr);
      
      // Handle validation errors
      if (createErr.name === 'ValidationError') {
        const errors = Object.values(createErr.errors).map(err => err.message);
        return res.status(400).json({ 
          message: "Validation error",
          errors: errors 
        });
      }
      
      if (createErr.code === 11000) {
        return res.status(409).json({ 
          message: "Email already exists" 
        });
      }
      
      throw createErr;
    }

    // Send verification email using emailService
    try {
      await sendVerificationEmail(newUser.email, token, newUser.name);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      // Return success but inform user about email issue
      return res.status(201).json({
        message: "User registered successfully, but verification email could not be sent. Please use resend verification email feature.",
        email: newUser.email,
        user: newUser,
        emailError: true
      });
    }

    return res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      email: newUser.email,
      user: newUser,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message });
  }
};


// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide email and password" });

    // check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    // compare password
    const isMatch = await user.comparePassword(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // generate token
    const token = signToken(user._id);

    return res
      .status(200)
      .json({ message: "Login successful", token, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// PROTECTED ROUTE MIDDLEWARE
export const protectedRoute = async (req, res, next) => {
  try {
    //  Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Unauthorized: Token has been invalidated",
      });
    }

    // Verify token (throws if invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from decoded token
    const user = await User.findById(decoded.id);

    if (!user) {
      // User doesn't exist - blacklist this token and all related tokens
      try {
        await blacklistToken(token, decoded.id, 'user_not_found');
        await blacklistAllUserTokens(decoded.id, 'user_not_found');
        console.log(`⚠️ User ${decoded.id} not found. Token blacklisted and all related tokens deleted.`);
      } catch (blacklistErr) {
        console.error('Error blacklisting token:', blacklistErr.message);
      }

      return res.status(401).json({
        message: "Unauthorized: User no longer exists",
        action: "please_login_again",
      });
    }

    // Check if password was changed after token was issued
    if (user.isPasswordChanged && user.isPasswordChanged(decoded.iat)) {
      // Blacklist token if password was changed
      try {
        await blacklistToken(token, user._id, 'password_changed');
      } catch (blacklistErr) {
        console.error('Error blacklisting token:', blacklistErr.message);
      }

      return res.status(401).json({
        message: "Unauthorized: Password changed recently, please login again",
      });
    }

    // Grant access
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      message: `unauthorized: invalid token ${err.message}`,
    });
  }
};

//User authorization middleware
export const restrictUser = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user.role) {
        return res.status(401).json({ message: "Unauthorized: No role attached" });
      }
      
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to access this resource" });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
};

// reset password middleware
// FORGOT PASSWORD - Send reset token to email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const { token, hashedToken } = generateResetToken();

    // Save hashed token to database with expiry (10 minutes)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send password reset email using emailService
    try {
      await sendPasswordResetEmail(user.email, token, user.name);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      return res.status(500).json({ message: "Failed to send password reset email. Please try again." });
    }

    return res.status(200).json({
      message: "Password reset link sent to your email"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// RESET PASSWORD - Reset password using token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Hash the token to match the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Check if token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Validate password
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Please provide password and confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Update password
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// CHANGE PASSWORD - Change password for logged-in users
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Get user with password field
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please provide new password and confirm password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Update password
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    // Generate new token for auto-login
    const newToken = signToken(user._id);

    return res.status(200).json({
      message: "Password changed successfully",
      token: newToken,
      user
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// VERIFY EMAIL - Verify email using token from email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to match the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() } // Check if token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Generate JWT token for auto-login
    const jwtToken = signToken(user._id);

    return res.status(200).json({
      message: "Email verified successfully",
      token: jwtToken,
      user
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// RESEND VERIFICATION EMAIL - Resend verification email if needed
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email address" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    // Generate new verification token
    const { token, hashedToken } = generateResetToken();

    // Save hashed token to database with expiry (24 hours)
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email using emailService
    try {
      await sendVerificationEmail(user.email, token, user.name);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    return res.status(200).json({
      message: "Verification email resent successfully. Please check your email."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// LOGOUT USER - Invalidate current token
export const logoutUser = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add token to blacklist
    await blacklistToken(token, userId, 'logout');

    return res.status(200).json({
      message: "Logged out successfully. Token has been invalidated.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// LOGOUT ALL DEVICES - Invalidate all tokens for user
export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    // Blacklist all tokens for this user
    const count = await blacklistAllUserTokens(userId, 'logout_all_devices');

    return res.status(200).json({
      message: `Logged out from all devices. Invalidated ${count} token(s).`,
      tokensInvalidated: count,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE USER - Delete user and invalidate all tokens
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please provide your password" });
    }

    // Verify password before deletion
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // Blacklist all tokens before deletion
    await blacklistAllUserTokens(userId, 'user_deleted');

    // Delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User account deleted successfully. All tokens have been invalidated.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};