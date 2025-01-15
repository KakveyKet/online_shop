const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String, // Assuming you store the image URL as a string
        required: true,
    },

}, { timestamps: true });

const Category = mongoose.model('Covers', categorySchema);

module.exports = Category;
