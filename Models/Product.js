// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String, // Assuming you store the image URL as a string
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
