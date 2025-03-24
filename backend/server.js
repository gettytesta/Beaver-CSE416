const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const app = express();
require('dotenv').config();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Session configuration
app.use(session({
    secret: process.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport-setup');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

app.get('/', async (_, res) => {
    return res.send('Hello, World');
});

// Start server
const PORT = process.env.BACKEND_PORTNO || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});