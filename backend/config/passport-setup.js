const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const { generateUniqueUsername } = require('../utils/usernameUtils');

// Set up Google OAuth credentials
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id }); // Check if user already exists in database

                if (user) {
                    return done(null, user); // User exists, return the user
                } else {
                    // Generate a unique username based on Google profile
                    const username = await generateUniqueUsername(
                        profile.displayName,
                        profile.emails[0].value
                    );
                    
                    // Create new user
                    const newUser = new User({
                        googleId: profile.id,
                        username: username,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        profilePicture: profile.photos[0].value,
                    });

                    user = await newUser.save();
                    return done(null, user);
                }
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
    if (user && user._id) {
      // It's a Google (DB) user: store their ID
      done(null, { type: 'db', id: user._id });
    } else {
      // It's a guest or no DB record:
      // store the entire user object (or some simplified version)
      done(null, { type: 'guest', guestData: user });
    }
  });

// Deserialize user from the session
passport.deserializeUser(async (serialized, done) => {
    try {
      if (serialized.type === 'db') {
        // We have a real DB user:
        const user = await User.findById(serialized.id);
        return done(null, user || null);
      } else {
        // It's a guest: no DB lookup required
        return done(null, serialized.guestData);
      }
    } catch (err) {
      done(err, null);
    }
  });
