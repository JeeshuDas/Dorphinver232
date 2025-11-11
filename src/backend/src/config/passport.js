const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const logger = require('./logger');

/**
 * Passport Configuration
 * Handles JWT and OAuth authentication strategies
 */

// JWT Strategy for protected routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      logger.error(`JWT Strategy error: ${error.message}`);
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, update OAuth info if needed
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos[0]?.value;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          authProvider: 'google',
        });

        logger.info(`✅ New user created via Google OAuth: ${user.email}`);
        return done(null, user);
      } catch (error) {
        logger.error(`Google OAuth error: ${error.message}`);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
