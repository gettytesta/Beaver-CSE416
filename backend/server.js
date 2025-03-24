const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const app = express();

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

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

app.get('/', async (_, res) => {
    return res.send('Hello, World');
});

// MongoDB Connection
const portno = process.env.BACKEND_PORTNO || 5000;
const mongoDB = process.env.MONGO_URI;

mongoose.connect(mongoDB)
    .then(() => {
        app.listen(portno, () => {
            console.log(`Express server listening to port ${portno}.`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err.message));