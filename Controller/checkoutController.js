const CheckOut = require('../Models/CheckOut');
const checkout = async (req, res) => {
    try {
        const { userId, cart, delivery, delivery_address, delivery_price, payment_type } = req.body;

        // Validate required fields
        if (!userId || !cart || !delivery || !delivery_address || !delivery_price || !payment_type) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate the cart structure
        if (!Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart must contain items" });
        }

        // Create a new checkout record with the provided cart details
        const checkout = new CheckOut({
            user: userId,
            cart: {
                items: cart.items.map((item) => ({
                    product: item.product, // Assuming `item.product` is the product ID
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                    discount: item.discount || 0,
                })),
                totalPrice: cart.totalPrice,
            },
            delivery,
            delivery_address,
            delivery_price,
            payment_type,
            status: false, // Default status for new checkouts
            date: new Date(), // Current date for the checkout
        });

        const savedCheckout = await checkout.save();

        res.status(201).json({
            message: "Checkout successful",
            checkout: savedCheckout,
            finalTotal: cart.totalPrice + delivery_price,
        });
    } catch (err) {
        console.error("Error during checkout:", err);
        res.status(500).json({ error: "Error during checkout", details: err.message });
    }
};

module.exports = { checkout };
