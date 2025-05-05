const express = require('express');
const router = express.Router();
const { getAuthenticatedUsers } = require('../controllers/userLookupController');

// GET /api/user-lookup/users → return all non-guest users
router.get('/users', getAuthenticatedUsers);

module.exports = router;