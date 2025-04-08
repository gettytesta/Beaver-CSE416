const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   GET /auth/google
 * @desc    Initiates Google OAuth2 authentication flow
 * @access  Public
 * @returns Redirects to Google's consent screen
 */
router.get("/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account consent", //force re-consent even if user is already signed in
    })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Handles the callback from Google OAuth2 authentication
 * @access  Public
 * @returns Redirects to frontend on success, or to /login-failed on failure
 */
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login-failed'
    }),
    authController.googleCallback
);

/**
 * @route   GET /auth/current-user
 * @desc    Retrieves the currently authenticated user's information
 * @access  Private
 * @returns {Object} User object containing profile information
 */
router.get('/current-user', authController.getCurrentUser);

/**
 * @route   GET /auth/logout
 * @desc    Logs out the current user and destroys their session
 * @access  Private
 * @returns Redirects to frontend after successful logout
 */
router.get('/logout', authController.logout);

//guest login
router.post('/guest', authController.guestLogin);

module.exports = router;