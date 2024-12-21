const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc Register a new user
 * @route POST /api/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Validate role
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role provided." });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ name, email, password: hashedPassword, role });
        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User registered successfully.",
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role },
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "An error occurred during registration." });
    }
};

/**
 * @desc Login user and generate a JWT token
 * @route POST /api/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "An error occurred during login." });
    }
};

/**
 * @desc Logout user
 * @route POST /api/logout
 */
const logout = (req, res) => {
    try {
        // Clear client-side token (handled on frontend)
        res.status(200).json({ message: "Logout successful." });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "An error occurred during logout." });
    }
};

module.exports = { register, login, logout };
