// routes/userRoutes.js

const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// Route to create a new user (register)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Respond with success message and user data (excluding password)
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
});

// Route to get all users
// Example route to get users with pagination
router.get('/getAllUser', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page query
        const limit = 10; // Number of users per page

        const users = await User.find() // Assuming you have a User model
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users', details: err.message });
    }
});

// Route to get a single user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
});

// Route to update user details
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, password }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
});

// Route to delete a user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
});

module.exports = router;
