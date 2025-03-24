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
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import required schemas
let Scenarios = require('./models/scenario')
let Distributions = require('./models/distribution')
let Users = require('./models/user')
let Investments = require('./models/investment')

// Start server
const PORT = process.env.BACKEND_PORTNO || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const yamlRoutes = require('./routes/yamlRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

app.use('/auth', authRoutes);
app.use('/api/yaml', yamlRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulations', simulationRoutes);

app.get('/', async (_, res) => {
    return res.send('Hello, World');
});

// Add a scenario to the database
app.post('/add_scenario/', (req, res) => {
    // TODO - MAKE THIS FUNCTIONAL
    Scenarios.create(req.body).then((dat) => {
        // TODO - MAKE SURE THE SCENARIO GETS ADDED TO THE USER'S SCENARIO LIST
        res.send("Scenario added")
    })
})