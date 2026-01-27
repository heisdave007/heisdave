import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import { configurePassport } from './utils/passportConfig.js'
import productRouters from './routers/productRouters.js'
import userRouters from './routers/userRouters.js'
import paymentRouters from './routers/paymentRouters.js'

dotenv.config({path: './config.env'})

const app = express()

// CORS middleware - Allow frontend to communicate with backend
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000'
    ],
    credentials: true
}));

// Raw body middleware for Stripe webhooks (must be before express.json())
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON middleware for other routes
app.use(express.json())
app.use(morgan('combined'))

// Session middleware for Passport
app.use(session({
    secret: process.env.PASSPORT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
configurePassport(passport);

// Static files
app.use(express.static('public'));

// Routes
app.use('/api/v1/products', productRouters)
app.use('/api/v1/users', userRouters)
app.use('/api/v1/payments', paymentRouters)

// MongoDB Connection
const MONGODB_URL = process.env.MONGODB_URL

if (!MONGODB_URL) {
    console.error('ERROR: MONGODB_URL not set in config.env');
    process.exit(1);
}

mongoose.connect(MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority'
})
.then((conn) => {
    console.log(`✓ Database connected successfully: ${conn.connection.host}`); 
})
.catch((err) => {
    console.error(`✗ Database connection failed: ${err.message}`);
    console.error('Make sure:');
    console.error('1. Your MongoDB URL is correct in config.env');
    console.error('2. Your IP address is whitelisted in MongoDB Atlas');
    console.error('3. Your database credentials are correct');
    process.exit(1);
});

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('⚠ MongoDB connection error:', err.message);
});

// Start server
const PORT = process.env.PORT || 4000

const server = app.listen(PORT, (err) => {
    if (err) {
        console.error(`✗ Server error: ${err.message}`);
        process.exit(1);
    } else {
        console.log(`✓ Server is running on port ${PORT}`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});