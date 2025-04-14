// TP - Claude AI was used to generate these tests.
// Prompt: Can you write a auth.test.js (Jest) script for testing the attached functionalities? <attached_files>

const express = require('express');
const request = require('supertest');
const session = require('express-session');

// Detailed mocking approach
jest.mock('passport', () => ({
    initialize: jest.fn(() => (req, res, next) => next()),
    session: jest.fn(() => (req, res, next) => next()),
    authenticate: jest.fn((strategy, options) => {
        return (req, res, next) => {
            if (strategy === 'google') {
                // Simulate successful authentication
                req.user = {
                    _id: 'test-user-id',
                    username: 'testuser',
                    email: 'test@example.com',
                    name: 'Test User',
                    profilePicture: 'http://example.com/picture.jpg'
                };
                next();
            } else {
                next(new Error('Authentication failed'));
            }
        };
    })
}));

// Mock the controller
jest.mock('../../controllers/authController', () => ({
    googleCallback: jest.fn((req, res) => {
        req.session.save(() => {
            res.redirect(process.env.CLIENT_REDIRECT_URL || 'http://localhost:3000/dashboard');
        });
    }),
    getCurrentUser: jest.fn((req, res) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                name: req.user.name,
                profilePicture: req.user.profilePicture
            }
        });
    }),
    logout: jest.fn((req, res) => {
        req.logout = jest.fn((callback) => {
            callback(null);
        });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }),
    guestLogin: jest.fn((req, res) => {
        const guestUser = { username: 'guest', isGuest: true };
        req.login = jest.fn((user, callback) => {
            callback(null);
        });
        res.status(200).json({
            success: true,
            user: guestUser
        });
    })
}));

// Dynamically import routes after mocking
const passport = require('passport');
const authRoutes = require('../../routes/authRoutes');
const authController = require('../../controllers/authController');

describe('Authentication Routes and Controllers', () => {
    let app;

    beforeEach(() => {
        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());
        app.use(session({
            secret: 'test secret',
            resave: false,
            saveUninitialized: true
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use('/auth', authRoutes);

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    // Google OAuth Routes Tests
    describe('Google OAuth Routes', () => {
        it('should handle Google OAuth callback successfully', async () => {
            const response = await request(app)
                .get('/auth/google/callback')
                .expect(302); // Expecting a redirect

            expect(response.headers.location).toMatch(/dashboard/);
        });
    });

    // Logout Route Tests
    describe('GET /auth/logout', () => {
        it('should successfully logout a user', async () => {
            const response = await request(app)
                .get('/auth/logout')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logged out successfully');
        });
    });

    // Guest Login Route Tests
    describe('POST /auth/guest', () => {
        it('should successfully login a guest user', async () => {
            const response = await request(app)
                .post('/auth/guest')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe('guest');
            expect(response.body.user.isGuest).toBe(true);
        });
    });
});