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
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});