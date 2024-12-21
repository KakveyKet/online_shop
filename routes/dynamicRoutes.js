const express = require('express');
const router = express.Router();
const dynamicCrudController = require('../routes/crudController');

// Define dynamic routes for any collection
router.route('/:collection')
    .get((req, res) => {
        const controller = dynamicCrudController(req.params.collection);  // Use the collection from the URL
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.getAll(req, res);
    })
    .post((req, res) => {
        const controller = dynamicCrudController(req.params.collection);  // Use the collection from the URL
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.create(req, res);
    });

router.route('/:collection/:id')
    .get((req, res) => {
        const controller = dynamicCrudController(req.params.collection);  // Use the collection from the URL
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.getOne(req, res);
    })
    .put((req, res) => {
        const controller = dynamicCrudController(req.params.collection);  // Use the collection from the URL
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.update(req, res);
    })
    .delete((req, res) => {
        const controller = dynamicCrudController(req.params.collection);  // Use the collection from the URL
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.delete(req, res);
    });

module.exports = router;
