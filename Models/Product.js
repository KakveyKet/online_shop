// models/productModel.js
const mongoose = require('mongoose')

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
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    status: {
        type: Boolean,
        default: true
    },
    is_favorite: {
        type: Boolean,
        default: false
    },
    capacity: {
        type: String,
        required: true,
    },
    code: { type: String, unique: true },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
