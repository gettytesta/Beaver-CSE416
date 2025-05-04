const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const app = express();
require('dotenv').config();

// For tax and rmd table updates
const taxService = require('./services/taxService');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport-setup');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Update tax and RMD table data
        try {
            await taxService.updateData();
            console.log('Tax and RMD data update completed');
        } catch (err) {
            console.error('Error updating tax data:', err);
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const yamlRoutes = require('./routes/yamlRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const userLookupRoutes = require('./routes/userLookupRoutes');


app.use('/auth', authRoutes);
app.use('/api/yaml', yamlRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/user-lookup', userLookupRoutes);

app.get('/', async (_, res) => {
    return res.send('Hello, World');
});

// Start server
const PORT = process.env.BACKEND_PORTNO || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});