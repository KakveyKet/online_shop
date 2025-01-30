const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        stock: { type: Number, required: true },
        rating: { type: Number, min: 1, max: 5, default: 1 },
        status: { type: Boolean, default: true },
        is_favorite: { type: Boolean, default: false },
        capacity: { type: String, required: true },
        discount: { type: Number, default: 0 },
        priority: { type: Boolean, default: false },
        is_fav_array_user: [{ type: String }], // Store user emails (or user IDs)
        code: { type: String, unique: true },
    },
    { timestamps: true }
);

productSchema.methods.toggleFavorite = async function (userEmail) {
    const index = this.is_fav_array_user.indexOf(userEmail);

    if (index === -1) {
        this.is_fav_array_user.push(userEmail); // Add if not present
    } else {
        this.is_fav_array_user.splice(index, 1); // Remove if already exists
    }

    await this.save();
    return this;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
