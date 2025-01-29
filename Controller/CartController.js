const Cart = require('../Models/Carts');
const Product = require('../Models/Product');

// Add more of an existing product to the cart or add new item
const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate input
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
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalPrice: 0,
            });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // If product exists in the cart, increment its quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // If product doesn't exist, add new item to the cart
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                discount: product.discount,
            });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            const discountMultiplier = item.discount ? (1 - item.discount) : 1;
            const itemPrice = item.price * item.quantity * discountMultiplier;
            return total + itemPrice;
        }, 0);

        // Save the updated cart
        await cart.save();

        // Return the updated cart
        res.status(200).json(cart);
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Error adding to cart", details: err.message });
    }
};

// Remove item or decrement quantity
const updateCartItem = async (req, res) => {
    try {
        const { userId, productId, action } = req.body;

        // Validate input
        if (!userId || !productId || !action) {
            return res.status(400).json({ error: "userId, productId, and action are required" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Find the product in the cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Product not found in cart" });
        }

        // Update quantity based on the action
        if (action === "increment") {
            cart.items[itemIndex].quantity += 1;
        } else if (action === "decrement") {
            cart.items[itemIndex].quantity -= 1;

            // Remove the item if quantity becomes 0
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
        } else {
            return res.status(400).json({ error: "Invalid action. Use 'increment' or 'decrement'." });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            const discountMultiplier = item.discount ? (1 - item.discount) : 1;
            const itemPrice = item.price * item.quantity * discountMultiplier;
            return total + itemPrice;
        }, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json(cart);
    } catch (err) {
        console.error("Error updating cart item:", err);
        res.status(500).json({ error: "Error updating cart item", details: err.message });
    }
};

module.exports = { addToCart, updateCartItem };
