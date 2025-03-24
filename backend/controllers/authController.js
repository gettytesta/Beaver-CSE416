// Google callback handler
exports.googleCallback = (req, res) => {
    // Successful authentication, redirect to client app
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5000'); 
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Populate the user's YAML files (just the IDs and names, not content)
        const user = await req.user.populate({
            path: 'yamlFiles',
            select: 'name description fileType createdAt updatedAt'
        });

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                yamlFiles: user.yamlFiles
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user data',
            error: error.message
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