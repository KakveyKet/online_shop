const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Register user route
router.post('/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await mongoose.connection.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password (optional, recommended for security)
        const hashedPassword = password; // Replace with actual hashing logic if needed

        // Insert new user
        const newUser = {
            name,
            email,
            password: hashedPassword,
        };

        const result = await mongoose.connection.collection('users').insertOne(newUser);

        res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
    } catch (error) {
        res.status(500).json({
            error: 'Error registering user',
            details: error.message,
        });
    }
});

module.exports = router;
