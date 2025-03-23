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