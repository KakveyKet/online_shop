const mongoose = require('mongoose');
const User = require('../Models/User');  // Import the User model
const Product = require('../Models/productModel');  // Import the Product model

// Dynamically load the model for the collection
const loadModel = (collection) => {
    switch (collection) {
        case 'users':
            return User;
        case 'products':
            return Product;
        // Add other models here as needed
        default:
            console.error(`Model for collection ${collection} not found.`);
            return null;
    }
};

// Dynamic CRUD operations for any collection
const dynamicCrudController = (collection) => {
    const model = loadModel(collection);
    if (!model) return null;

    return {
        // Create a new item
        create: async (req, res) => {
            try {
                const newItem = new model(req.body);
                const savedItem = await newItem.save();
                res.status(201).json(savedItem);
            } catch (err) {
                res.status(400).json({ error: 'Error creating item', details: err });
            }
        },

        // Get all items
        getAll: async (req, res) => {
            try {
                const items = await model.find();
                res.status(200).json(items);
            } catch (err) {
                res.status(500).json({ error: 'Error fetching items', details: err });
            }
        },

        // Get a single item by ID
        getOne: async (req, res) => {
            try {
                const item = await model.findById(req.params.id);
                if (!item) return res.status(404).json({ error: 'Item not found' });
                res.status(200).json(item);
            } catch (err) {
                res.status(500).json({ error: 'Error fetching item', details: err });
            }
        },

        // Update an item by ID
        update: async (req, res) => {
            try {
                const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
                res.status(200).json(updatedItem);
            } catch (err) {
                res.status(400).json({ error: 'Error updating item', details: err });
            }
        },

        // Delete an item by ID
        delete: async (req, res) => {
            try {
                const deletedItem = await model.findByIdAndDelete(req.params.id);
                if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
                res.status(200).json({ message: 'Item deleted successfully' });
            } catch (err) {
                res.status(500).json({ error: 'Error deleting item', details: err });
            }
        }
    };
};

module.exports = dynamicCrudController;
