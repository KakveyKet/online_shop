const express = require('express');
const dynamicCrudController = require('../Controller/DynamicController');
const cartController = require('../Controller/CartController');
const router = express.Router();

// Define collections to handle
const collections = ['users', 'products', 'categories', 'deliveries', 'carts', 'covers'];

collections.forEach((collection) => {
    const controller = dynamicCrudController(collection);
    if (controller) {
        router.post(`/${collection}`, controller.create);
        router.get(`/${collection}`, controller.getAll);
        router.patch(`/${collection}/:id`, controller.update);
        router.delete(`/${collection}/:id`, controller.delete);
        router.post('/carts', cartController.addToCart);
    }
});

module.exports = router;
