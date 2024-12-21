const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File must be an image'));
        }
        cb(null, true);
    },
});

module.exports = upload;
