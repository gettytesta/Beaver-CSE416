// Google callback handler
exports.googleCallback = (req, res) => {
    // Successful authentication, redirect to client app
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5000'); 
};

// Get current user
exports.getCurrentUser = (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                profilePicture: req.user.profilePicture
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
};

// Logout
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    });
};