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
        required: false,
    },
    is_reminder: {
        type: Boolean,
        required: false,
        default: true,
    },
    status: {
        type: Boolean,
        required: false,
        default: true,
    },
    profileImage: {
        type: String,
        required: false,
        default: null,
    },
    phoneNumber: {
        type: String,
        required: false,
        default: null,
    },
    resetToken: {
        type: String,
        default: null
    },
    resetedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.add({
    fullName: {
        type: String,
        required: false,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;  // Ensure this line is correct
