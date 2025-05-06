// Handles tracking and deleting guest data when expiring
const User = require('../models/user');
const { Scenario } = require('../models/scenario');

const DAY = 24 * 60 * 60 * 1000;

// entry into guests looks like { user.id: expiryTime }
let guests = {}

async function onRequest(req, res, next)
{
    if (req.user?.isGuest)
        guests[req.user.id] = Date.now() + DAY;
    for (const id of Object.keys(guests))
    {
        if (guests[id] <= Date.now()) // time to wipe their data
        {
            await Scenario.deleteMany({ userId: id, });
            await User.findByIdAndDelete(id);
        }
    }
    next();
}

module.exports = onRequest;