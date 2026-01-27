import LocalStrategy from 'passport-local';
import JwtStrategy from 'passport-jwt';
import { User } from '../schemas/userSchema.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const JwtStrategyConfig = JwtStrategy.Strategy;
const ExtractJwt = JwtStrategy.ExtractJwt;

export const configurePassport = (passport) => {
  // Local Strategy for login
  passport.use(
    'local',
    new LocalStrategy.Strategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select('+password');

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if email is verified
          if (!user.isEmailVerified) {
            return done(null, false, {
              message: 'Please verify your email first',
              requiresEmailVerification: true,
              email: user.email,
            });
          }

          // Compare passwords
          const isPasswordMatch = await user.comparePassword(password, user.password);

          if (!isPasswordMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy for protected routes
  passport.use(
    'jwt',
    new JwtStrategyConfig(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id);

          if (!user) {
            return done(null, false);
          }

          // Check if password was changed after token was issued
          if (user.isPasswordChanged && user.isPasswordChanged(payload.iat)) {
            return done(null, false, {
              message: 'Password recently changed. Please login again.',
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default configurePassport;
