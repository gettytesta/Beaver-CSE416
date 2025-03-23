const DEFAULT_PORTNO = 3000;

const express = require('express');
const app = express();

app.get('/', async (_, res) => {
    return res.send('Hello, World');
});


const portno = process.env.BACKEND_PORTNO || DEFAULT_PORTNO;
app.listen(portno, err => {
    if (err)
        return console.error(err.message);
    console.log(`Express server listening to port ${portno}.`);
});


// Start MongoDB server
var mongoose = require('mongoose')
var mongoDB = 'mongodb://127.0.0.1:27017/beaver_lfp'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// Import required schemas
let Investment = require('./models/investment')
let Scenario = require('./models/scenario')
let User = require('./models/user')
let EventSeries = require('./models/eventseries')
