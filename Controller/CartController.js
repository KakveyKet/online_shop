// Controller function to add item to cart
const Cart = require('../Models/Carts');
const Product = require('../Models/Product'); // Assuming you have a Product model

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ error: "userId, productId, and quantity are required" });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be a positive number" });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalPrice: 0,
            });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product._id.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update the quantity if the product already exists in the cart
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add the new product to the cart
            cart.items.push({ product: productId, quantity });
        }

        // Recalculate the total price and ensure it's a valid number
        cart.totalPrice = cart.items.reduce((total, item) => {
            const itemPrice = item.product.price * item.quantity;
            if (isNaN(itemPrice)) {
                console.error(`Invalid price for product ${item.product._id}`);
                return total;
            }
            return total + itemPrice;
        }, 0);

        // Ensure the totalPrice is a valid number
        if (isNaN(cart.totalPrice)) {
            cart.totalPrice = 0; // Default to 0 if the calculation is invalid
        }

        // Save the updated cart
        const updatedCart = await cart.save();

        // Return the updated cart
        res.status(200).json(updatedCart);
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Error adding to cart", details: err.message });
    }
}

module.exports = { addToCart };
