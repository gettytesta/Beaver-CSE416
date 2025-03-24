/**
 * Authenticates the user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next function
 */
function authenticateUser(req, res, next) {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
    next();
}

module.exports = {
    authenticateUser
};