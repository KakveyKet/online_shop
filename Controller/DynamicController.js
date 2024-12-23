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
                const { page = 1, limit = 10, searchColumn = [], ...filters } = req.query;
                let searchColumnArray = Array.isArray(searchColumn) ? searchColumn : searchColumn.split(',');

                // Validate and parse pagination parameters
                const pageNumber = Math.max(parseInt(page, 10), 1); // Ensure page is at least 1
                const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 100); // Limit between 1 and 100

                // Build query conditions
                const queryConditions = [];

                // Handle status filter
                if (filters.status) {
                    queryConditions.push({ status: filters.status === "true" });
                }

                // Handle dynamic search columns (e.g., name, email)
                if (searchColumnArray.length > 0 && filters.search) {
                    const searchQuery = { $regex: filters.search, $options: "i" };
                    searchColumnArray.forEach(column => {
                        queryConditions.push({ [column]: searchQuery });
                    });
                }

                const finalQuery = queryConditions.length > 0 ? { $and: queryConditions } : {};

                // Fetch paginated data
                const items = await model
                    .find(finalQuery)
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);

                // Count total items
                const totalItems = await model.countDocuments(finalQuery);

                // Respond with paginated data
                res.status(200).json({
                    data: items,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalItems / limitNumber),
                    totalItems,
                });
            } catch (err) {
                res.status(500).json({
                    error: "Error fetching items",
                    details: err.message,
                });
            }
        },


        // Get a single item by ID
        // getOne: async (req, res) => {
        //     try {
        //         const item = await model.findById(req.params.id);
        //         if (!item) return res.status(404).json({ error: "Item not found" });
        //         res.status(200).json(item);
        //     } catch (err) {
        //         res.status(500).json({ error: "Error fetching item", details: err });
        //     }
        // },
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
    };
};

module.exports = dynamicCrudController;
