const Scenario = require('../models/scenario');
const User = require('../models/user');
const { AccessLevels } = require('../models/sharedUser');

/**
 * Get all scenarios for the authenticated user
 */
exports.getScenarios = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Find scenarios where user is the owner
        const ownedScenarios = await Scenario.find({ userId: req.user._id });
        
        // Find scenarios shared with the user
        const sharedScenarios = await Scenario.find({
            'sharedWith.userId': req.user._id
        });

        // Combine and add ownership information
        const allScenarios = [
            ...ownedScenarios.map(scenario => ({
                ...scenario.toObject(),
                isOwner: true,
                accessLevel: 'owner'
            })),
            ...sharedScenarios.map(scenario => {
                const sharedInfo = scenario.sharedWith.find(share => 
                    share.userId.toString() === req.user._id.toString()
                );
                return {
                    ...scenario.toObject(),
                    isOwner: false,
                    accessLevel: sharedInfo ? sharedInfo.accessLevel : null
                };
            })
        ];
        
        res.status(200).json({
            success: true,
            count: allScenarios.length,
            data: allScenarios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving scenarios',
            error: error.message
        });
    }
};

/**
 * Get a single scenario by ID
 */
exports.getScenario = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const scenario = await Scenario.findById(req.params.id);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if user is owner or has access
        if (scenario.userId.toString() === req.user._id.toString()) {
            // User is the owner
            return res.status(200).json({
                success: true,
                data: {
                    ...scenario.toObject(),
                    isOwner: true,
                    accessLevel: 'owner'
                }
            });
        }

        // Check if scenario is shared with user
        const sharedInfo = scenario.sharedWith.find(share => 
            share.userId.toString() === req.user._id.toString()
        );

        if (sharedInfo) {
            return res.status(200).json({
                success: true,
                data: {
                    ...scenario.toObject(),
                    isOwner: false,
                    accessLevel: sharedInfo.accessLevel
                }
            });
        }

        // User doesn't have access
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this scenario'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving scenario',
            error: error.message
        });
    }
};

/**
 * Create a new scenario
 */
exports.createScenario = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Add userId to scenario data
        const scenarioData = {
            ...req.body,
            userId: req.user._id
        };

        // Create new scenario
        const scenario = new Scenario(scenarioData);
        await scenario.save();

        res.status(201).json({
            success: true,
            data: scenario
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating scenario',
            error: error.message
        });
    }
};

/**
 * Update a scenario
 */
exports.updateScenario = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
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

        // Check user's access level
        const isOwner = scenario.userId.toString() === req.user._id.toString();
        
        if (!isOwner) {
            // Check if user has read-write access
            const sharedInfo = scenario.sharedWith.find(share => 
                share.userId.toString() === req.user._id.toString()
            );
            
            if (!sharedInfo || sharedInfo.accessLevel !== AccessLevels.READ_WRITE) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this scenario'
                });
            }
        }

        // Do not allow changing userId or sharedWith via regular update
        delete req.body.userId;
        delete req.body.sharedWith;
        
        const updatedScenario = await Scenario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                ...updatedScenario.toObject(),
                isOwner,
                accessLevel: isOwner ? 'owner' : AccessLevels.READ_WRITE
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating scenario',
            error: error.message
        });
    }
};

/**
 * Delete a scenario
 */
exports.deleteScenario = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const scenario = await Scenario.findById(req.params.id);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Only the owner can delete a scenario
        if (scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this scenario'
            });
        }

        // Delete the scenario
        await Scenario.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Scenario deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting scenario',
            error: error.message
        });
    }
};

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