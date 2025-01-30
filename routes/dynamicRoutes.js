const express = require('express');
const dynamicCrudController = require('../Controller/DynamicController');
const checkout = require('../Controller/checkoutController');
const cartController = require('../Controller/CartController');
const { toggleFavorite } = require('../Controller/FavController');
const router = express.Router();

// Define collections to handle
const collections = ['users', 'products', 'categories', 'deliveries', 'carts', 'covers', 'checkouts'];

collections.forEach((collection) => {
    const controller = dynamicCrudController(collection);
    if (controller) {
        router.post(`/${collection}`, controller.create);
        router.get(`/${collection}`, controller.getAll);
        router.patch(`/${collection}/:id`, controller.update);
        router.delete(`/${collection}/:id`, controller.delete);
        router.post('/carts', cartController.addToCart);  // Add item or increase quantity
        router.patch('/carts/update', cartController.updateCartItem);  // Update item quantity or remove
        router.post('/checkout', checkout.checkout);
        router.post('/products/:productId/favorite', toggleFavorite);
    }
});

module.exports = router;
