// Google callback handler
exports.googleCallback = (req, res) => {
    req.session.save(() => {
      res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/dashboard');
    });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        if (req.user) {
            // Populate the user's YAML files (just the IDs and names, not content)
            //const user = await req.user.populate({
                //path: 'yamlFiles',
                //select: 'name description fileType createdAt updatedAt'
            //});

            // Removed yamlFiles population because we're no longer using a unified YamlFile model.
            // Instead, user-uploaded YAMLs are stored separately as either Scenario or StateTaxYaml models.
            // Keeping this populate call would result in a Mongoose error since 'YamlFile' is not registered.
            const user = req.user;

            return res.status(200).json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    //yamlFiles: user.yamlFiles
                }
            });
        }

        // Handle guest sessions (added)
        if (req.session?.passport?.user?.isGuest) {
            return res.status(200).json({
                success: true,
                user: {
                    username: "Guest",
                    isGuest: true
                }
            });
        }

        // No authenticated user or guest
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    } 
    
    catch (error) {
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


exports.guestLogin = (req, res) => {
    // create a simple guest user object
    //const guestUser = { username: 'guest', isGuest: true };
  
    // Log them in using passport
    /*
    req.login(guestUser, (err) => {
      if (err) {
        console.error('Guest login error:', err);
        return res.status(500).json({ success: false, message: 'Guest login failed' });
      }
      return res.status(200).json({ success: true, user: guestUser });
    });
    */
    req.session.save(() => {
        //res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/dashboard');
        return res.status(200).json({ success: true });
    });
  };

  