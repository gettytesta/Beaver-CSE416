const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Google Auth Routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Google callback route
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login-failed'
    }),
    authController.googleCallback
);

// Get current user
router.get('/current-user', authController.getCurrentUser);

// Logout
router.get('/logout', authController.logout);

module.exports = router;