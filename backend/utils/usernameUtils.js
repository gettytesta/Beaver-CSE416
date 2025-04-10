const User = require('../models/user');

/**
 * Generate a unique username based on Google account information
 * If the username already exists, append a number to make it unique
 * @param {string} displayName - The display name of the user
 * @param {string} email - The email of the user
 * @returns {string} - The unique username
 */
exports.generateUniqueUsername = async (displayName, email) => {
    // Start with base username from displayName (remove spaces, lowercase)
    let baseUsername = displayName.replace(/\s+/g, '').toLowerCase();
    
    // If too short, use part of email
    if (baseUsername.length < 4) {
        const emailPrefix = email.split('@')[0];
        baseUsername = emailPrefix.toLowerCase();
    }
    
    // Truncate if too long
    if (baseUsername.length > 20) {
        baseUsername = baseUsername.substring(0, 20);
    }
    
    // Try the base username first
    let username = baseUsername;
    let counter = 1;
    let isUnique = false;
    
    // Keep checking until we find a unique username
    while (!isUnique) {
        const existingUser = await User.findOne({ username });
        
        if (!existingUser) {
            isUnique = true;
        } else {
            // Append counter to make unique
            username = `${baseUsername}${counter}`;
            counter++;
        }
    }
    
    return username;
}
