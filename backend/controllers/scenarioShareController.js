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
