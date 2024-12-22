const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,

    },
    is_reminder: {
        type: Boolean,
        required: true,
        default: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
    profileImage: {
        type: String,
        required: false, // Optional field
        default: null,  // Default to null if no image is provided
    },
    phoneNumber: {
        type: String,
        required: false, // Optional field
        default: null,  // Default to null if no image is provided
    },
}, { timestamps: true });

userSchema.add({
    fullName: {
        type: String,
        required: false,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;  // Ensure this line is correct
