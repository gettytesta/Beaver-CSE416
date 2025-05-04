const { Scenario } = require('../models/scenario');
const User = require('../models/user');
const { AccessLevels } = require('../models/sharedUser');

/**
 * Share a scenario with another user
 */
exports.shareScenario = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { username, accessLevel } = req.body;

        // Validate required fields
        if (!username || !accessLevel) {
            return res.status(400).json({
                success: false,
                message: 'Username and access level are required'
            });
        }

        // Validate access level
        if (!Object.values(AccessLevels).includes(accessLevel)) {
            return res.status(400).json({
                success: false,
                message: `Access level must be one of: ${Object.values(AccessLevels).join(', ')}`
            });
        }

        // Find the user to share with
        const shareWithUser = await User.findOne({ username });
        
        if (!shareWithUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the scenario
        const scenario = await Scenario.findById(req.params.id);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if the requester is the owner
        if (scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can share this scenario'
            });
        }

        // Cannot share with yourself
        if (shareWithUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot share a scenario with yourself'
            });
        }

        // Check if already shared with this user
        const existingShare = scenario.sharedWith.find(share => 
            share.userId.toString() === shareWithUser._id.toString()
        );

        if (existingShare) {
            // Update existing share
            existingShare.accessLevel = accessLevel;
        } else {
            // Add new share
            scenario.sharedWith.push({
                userId: shareWithUser._id,
                accessLevel
            });
        }

        await scenario.save();

        res.status(200).json({
            success: true,
            message: `Scenario shared with ${username} successfully`,
            data: scenario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sharing scenario',
            error: error.message
        });
    }
};

/**
 * Remove sharing for a user
 */
exports.removeShare = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { userId } = req.params;

        // Find the scenario
        const scenario = await Scenario.findById(req.params.id);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if the requester is the owner
        if (scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can modify sharing permissions'
            });
        }

        // Remove the share
        scenario.sharedWith = scenario.sharedWith.filter(share => 
            share.userId.toString() !== userId
        );

        await scenario.save();

        res.status(200).json({
            success: true,
            message: 'Sharing permission removed successfully',
            data: scenario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing share',
            error: error.message
        });
    }
};

/**
 * Get all users a scenario is shared with
 */
exports.getSharedUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Find the scenario
        const scenario = await Scenario.findById(req.params.id)
            .populate('sharedWith.userId', 'username name email profilePicture');
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if the requester is the owner
        if (scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can view sharing details'
            });
        }

        res.status(200).json({
            success: true,
            count: scenario.sharedWith.length,
            data: scenario.sharedWith
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving shared users',
            error: error.message
        });
    }
}; 


/* THIS CODE WAS WORKING BEFORE BUT ADDED OBJECTS IDS TO MY INVESTMESTMENTS

exports.shareScenario = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { username, accessLevel } = req.body;
    const scenarioId = req.params.id;

    //console.log("🔥 Incoming share request body:", { username, accessLevel });
    //console.log("🔥 Scenario ID from params:", scenarioId);
    //console.log("🔥 Authenticated user from middleware:", req.user);

    // Validate
    if (!username || !accessLevel) {
      return res.status(400).json({ success: false, message: 'Username and access level are required' });
    }

    const { AccessLevels } = require('../models/sharedUser');
    if (!Object.values(AccessLevels).includes(accessLevel)) {
      return res.status(400).json({ success: false, message: `Access level must be one of: ${Object.values(AccessLevels).join(', ')}` });
    }

    // Find target user and scenario
    const shareWithUser = await User.findOne({ username });
    if (!shareWithUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const scenario = await Scenario.findById(scenarioId).select('sharedWith userId'); // 👈 Only fetch minimal fields
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    //console.log("✅ Scenario found:", scenario.name);
    //console.log("🔒 Owner:", scenario.userId, "| Requester:", req.user._id);

    if (scenario.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can share this scenario' });
    }

    if (shareWithUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot share a scenario with yourself' });
    }

    // Modify sharedWith array only
    const existingShare = scenario.sharedWith.find(share => 
      share.userId.toString() === shareWithUser._id.toString()
    );

    if (existingShare) {
      existingShare.accessLevel = accessLevel;
    } else {
      scenario.sharedWith.push({ userId: shareWithUser._id, accessLevel });
    }

    await scenario.save(); 

    //console.log(`➕ Shared with ${username} as ${accessLevel}`);
    res.status(200).json({
      success: true,
      message: `Scenario shared with ${username} successfully`,
    });
  } catch (error) {
    //console.error("💥 Error in shareScenario:", error);
    res.status(500).json({
      success: false,
      message: 'Error sharing scenario',
      error: error.message,
    });
  }
};


exports.removeShare = async (req, res) => {
try {
  console.log('Remove share request received for scenario ID:', req.params.id);

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const { userId } = req.params;

  // Find the scenario
  const scenario = await Scenario.findById(req.params.id);
  if (!scenario) {
    return res.status(404).json({
      success: false,
      message: 'Scenario not found'
    });
  }

  // Check if the requester is the owner
  if (scenario.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the owner can modify sharing permissions'
    });
  }

  console.log('Scenario found:', scenario);

  // Remove the share from the 'sharedWith' array
  scenario.sharedWith = scenario.sharedWith.filter(share => 
    share.userId.toString() !== userId
  );

  // Ensure that the investments array stays intact with 'id' field
  scenario.investments.forEach(investment => {
    if (!investment.id) {
      investment.id = investment._id; // Set 'id' if it doesn't exist
    }
  });

  // Save the scenario without triggering validation on other fields
  await scenario.save({ validate: false });  // Skip validation to avoid investment validation errors

  res.status(200).json({
    success: true,
    message: 'Sharing permission removed successfully',
    data: scenario
  });
} catch (error) {
  console.error("Error removing share:", error);
  res.status(500).json({
    success: false,
    message: 'Error removing share',
    error: error.message
  });
}
};

exports.getSharedUsers = async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).json({
              success: false,
              message: 'Not authenticated'
          });
      }

      // Find the scenario
      const scenario = await Scenario.findById(req.params.id)
          .populate('sharedWith.userId', 'username name email profilePicture');
      
      if (!scenario) {
          return res.status(404).json({
              success: false,
              message: 'Scenario not found'
          });
      }

      // Check if the requester is the owner
      if (scenario.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
              success: false,
              message: 'Only the owner can view sharing details'
          });
      }

      res.status(200).json({
          success: true,
          count: scenario.sharedWith.length,
          data: scenario.sharedWith
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error retrieving shared users',
          error: error.message
      });
  }
}; */