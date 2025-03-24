const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with username and timestamp
        const username = req.user.username;
        const timestamp = Date.now();
        const uniquePrefix = `${username}_${timestamp}`;
        const fileExt = path.extname(file.originalname);
        cb(null, uniquePrefix + fileExt);
    }
});

// File filter for YAML files
const fileFilter = (req, file, cb) => {
    // Only accept YAML files
    if (file.mimetype === 'application/x-yaml' || 
        file.originalname.endsWith('.yaml') || 
        file.originalname.endsWith('.yml')) {
        cb(null, true);
    } else {
        cb(new Error('Only YAML files are allowed'), false);
    }
};

// Configure multer with storage and limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: fileFilter
});

module.exports = {
    upload
}; 