import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function (el) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(el);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        },
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords do not match"

        },

        select: false,

    },
     profilepic: {
        type: String,
        default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailConfirmationToken: String,
    emailConfirmationExpires: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isEmailConfirmed: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: Date,
});

// Hash password before saving
userSchema.pre('save', async function () {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // Remove confirmPassword field after hashing
        this.confirmPassword = undefined;
    } catch (error) {
        throw error;
    }
});
// Compare entered password with the hased password
userSchema.methods.comparePassword = async function (enteredPassword, hasedPassword)
 {
    return await bcrypt.compare(enteredPassword, hasedPassword);
};

export const User = mongoose.model('User', userSchema);