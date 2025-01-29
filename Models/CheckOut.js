const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    cart: {
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: { type: Number, required: true }, // Snapshot of product price
                image: { type: String, required: true }, // Snapshot of product image
                discount: { type: Number, default: 0 }, // Snapshot of product discount
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    status: {
        type: Boolean,
        default: false,
    },
    delivery: {
        type: String,
        required: true,
    },
    delivery_address: {
        type: String,
        required: true,
    },
    delivery_price: {
        type: Number,
        required: true,
    },
    payment_type: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const CheckOut = mongoose.model('CheckOut', checkoutSchema);

module.exports = CheckOut;
