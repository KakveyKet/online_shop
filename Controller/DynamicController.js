const mongoose = require('mongoose');
const User = require("../Models/User");
const Product = require("../Models/Product");
const Category = require("../Models/Category");
const upload = require("../upload/upload");
// Dynamically load the model for the collection
const loadModel = (collection) => {
    switch (collection.toLowerCase()) {
        case "users":
            return User;
        case "products":
            return Product;
        case "categories":
            return Category;
        default:
            console.error(`Model for collection "${collection}" not found.`);
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
            upload.single("image")(req, res, async (err) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ error: "Error uploading image", details: err.message });
                }

                try {
                    // Create a new item and save the image path
                    const newItem = new model({
                        ...req.body,
                        image: req.file ? req.file.path : null, // Save the image path in the model
                    });

                    const savedItem = await newItem.save();
                    res.status(201).json(savedItem);
                } catch (err) {
                    res.status(400).json({ error: "Error creating item", details: err });
                }
            });
        },

        // Get all items
        getAll: async (req, res) => {
            try {
                const items = await model.find();
                res.status(200).json(items);
            } catch (err) {
                res.status(500).json({ error: "Error fetching items", details: err });
            }
        },

        // Get a single item by ID
        getOne: async (req, res) => {
            try {
                const item = await model.findById(req.params.id);
                if (!item) return res.status(404).json({ error: "Item not found" });
                res.status(200).json(item);
            } catch (err) {
                res.status(500).json({ error: "Error fetching item", details: err });
            }
        },
        // Update an item by ID
        update: async (req, res) => {
            upload.single("image")(req, res, async (err) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ error: "Error uploading image", details: err.message });
                }

                try {
                    // If an image is uploaded, use the new image path
                    const updatedData = req.body;
                    if (req.file) {
                        updatedData.image = req.file.path; // Save the new image path
                    }

                    // Update the item with the new data (including image if uploaded)
                    const updatedItem = await model.findByIdAndUpdate(
                        req.params.id,
                        updatedData,
                        { new: true }
                    );

                    if (!updatedItem)
                        return res.status(404).json({ error: "Item not found" });

                    res.status(200).json(updatedItem);
                } catch (err) {
                    res.status(400).json({ error: "Error updating item", details: err });
                }
            });
        },

        // Delete an item by ID
        delete: async (req, res) => {
            try {
                const deletedItem = await model.findByIdAndDelete(req.params.id);
                if (!deletedItem)
                    return res.status(404).json({ error: "Item not found" });
                res.status(200).json({ message: "Item deleted successfully" });
            } catch (err) {
                res.status(500).json({ error: "Error deleting item", details: err });
            }
        },

        // Get filtered data


    };
};

module.exports = dynamicCrudController;
