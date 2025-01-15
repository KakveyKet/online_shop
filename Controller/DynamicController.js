const mongoose = require("mongoose");
const User = require("../Models/User");
const Product = require("../Models/Product");
const Category = require("../Models/Category");
const Delivery = require("../Models/Delivery");
const Cart = require("../Models/Carts");
const Covers = require("../Models/CoverImageModel");
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
        case "deliveries":
            return Delivery;
        case "carts":
            return Cart;
        case "covers":
            return Covers;
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
                    return res.status(400).json({ error: "Error uploading image", details: err.message });
                }

                try {
                    if (!req.body.code) {
                        req.body.code = "default_code_" + Date.now();
                    }

                    const newItem = new model({
                        ...req.body,
                        image: req.file ? req.file.path : null,
                    });

                    const savedItem = await newItem.save();
                    res.status(201).json(savedItem);
                } catch (err) {
                    console.error("Error creating item:", err);
                    res.status(400).json({ error: "Error creating item", details: err.message });
                }
            });
        }
        ,

        // Get all items
        getAll: async (req, res) => {
            try {
                const {
                    page = 1,
                    limit = 10,
                    searchColumn = [],
                    ...filters
                } = req.query;

                let searchColumnArray = Array.isArray(searchColumn)
                    ? searchColumn
                    : searchColumn.split(",");

                const pageNumber = Math.max(parseInt(page, 10), 1);
                const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 100);

                const queryConditions = [];

                for (const [key, value] of Object.entries(filters)) {
                    if (value) {
                        if (key === "_id") {
                            // Convert the _id string to ObjectId
                            queryConditions.push({ [key]: mongoose.Types.ObjectId(value) });
                        } else if (key === "search" && searchColumnArray.length > 0) {
                            const searchQuery = { $regex: String(value), $options: "i" };
                            const orConditions = searchColumnArray.map((column) => ({
                                [column]: searchQuery,
                            }));
                            queryConditions.push({ $or: orConditions });
                        } else if (value.includes("||")) {
                            const orConditions = value
                                .split("||")
                                .map((val) => ({ [key]: val.trim() }));
                            queryConditions.push({ $or: orConditions });
                        } else if (value.includes("&&")) {
                            const andConditions = value
                                .split("&&")
                                .map((val) => ({ [key]: val.trim() }));
                            queryConditions.push({ $and: andConditions });
                        } else if (!isNaN(value)) {
                            queryConditions.push({ [key]: Number(value) });
                        } else if (value === "true" || value === "false") {
                            queryConditions.push({ [key]: value === "true" });
                        } else {
                            queryConditions.push({
                                [key]: { $regex: String(value), $options: "i" },
                            });
                        }
                    }
                }

                const finalQuery =
                    queryConditions.length > 0 ? { $and: queryConditions } : {};

                const items = await model
                    .find(finalQuery)
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);

                const totalItems = await model.countDocuments(finalQuery);

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
        }
        ,



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
        // addToCart: async (req, res) => {
        //     try {
        //         const { userId, productId, quantity } = req.body;

        //         // Validate input
        //         if (!userId || !productId || !quantity) {
        //             return res.status(400).json({ error: "userId, productId, and quantity are required" });
        //         }

        //         // Find the product
        //         const product = await Product.findById(productId);
        //         if (!product) {
        //             return res.status(404).json({ error: "Product not found" });
        //         }

        //         // Find or create the user's cart
        //         let cart = await Cart.findOne({ user: userId }).populate('items.product');
        //         if (!cart) {
        //             cart = new Cart({
        //                 user: userId,
        //                 items: [],
        //                 totalPrice: 0,
        //             });
        //         }

        //         // Check if the product is already in the cart
        //         const existingItemIndex = cart.items.findIndex(
        //             (item) => item.product._id.toString() === productId
        //         );

        //         if (existingItemIndex > -1) {
        //             // Update the quantity if the product already exists in the cart
        //             cart.items[existingItemIndex].quantity += quantity;
        //         } else {
        //             // Add the new product to the cart
        //             cart.items.push({ product: productId, quantity });
        //         }

        //         // Recalculate the total price
        //         cart.totalPrice = cart.items.reduce((total, item) => {
        //             // Ensure the product is populated with price
        //             const itemPrice = item.product.price * item.quantity;
        //             if (isNaN(itemPrice)) {
        //                 console.error("Invalid price calculation:", item.product.price, item.quantity);
        //             }
        //             return total + itemPrice;
        //         }, 0);

        //         // Debugging: Check calculated total price
        //         console.log("Calculated Total Price:", cart.totalPrice);

        //         // Save the updated cart
        //         const updatedCart = await cart.save();

        //         res.status(200).json(updatedCart);
        //     } catch (err) {
        //         console.error("Error adding to cart:", err);
        //         res.status(500).json({ error: "Error adding to cart", details: err.message });
        //     }
        // }



    };
};

module.exports = dynamicCrudController;
