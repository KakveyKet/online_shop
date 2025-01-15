const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

const Delivery = mongoose.model('Delivery', DeliverySchema);

module.exports = Delivery;
