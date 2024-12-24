// models/cartModel.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1, // Ensure at least 1 item is added
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            default: 0, // Automatically calculated
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
