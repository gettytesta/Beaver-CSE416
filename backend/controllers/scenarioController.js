const { Scenario } = require('../models/scenario');
const User = require('../models/user');
const { AccessLevels } = require('../models/sharedUser');

/**
 * Get all scenarios for the authenticated user
 */
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
