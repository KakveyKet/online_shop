const Cart = require('../Models/Carts');
const Product = require('../Models/Product');

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, userName, email } = req.body;

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
                userName: userName,
                email: email,
                items: [],
                totalPrice: 0,
            });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                discount: product.discount,
            });
        }


        // Save the updated cart
        await cart.save();

        // Populate product details and recalculate total price
        cart = await Cart.findById(cart._id).populate('items.product');
        cart.totalPrice = cart.items.reduce((total, item) => {
            const discountMultiplier = item.product.discount
                ? (1 - item.product.discount / 100)
                : 1; // Calculate the discount multiplier (e.g., 20% discount = 0.8)
            const itemPrice = item.product.price * item.quantity * discountMultiplier;
            return total + itemPrice;
        }, 0);

        // Save the updated cart with recalculated total price
        await cart.save();

        // Return the populated cart
        res.status(200).json(cart);
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Error adding to cart", details: err.message });
    }
};

module.exports = { addToCart };
