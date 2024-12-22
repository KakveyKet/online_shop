const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword, role });
        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User registered successfully.",
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role },
        });
    } catch (err) {
        console.error("Registration error:", err.message || err);
        res.status(500).json({ error: "An error occurred during registration." });
    }
};

/**
 * Login user and generate JWT
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log('Generated Token:', token);

        res.status(200).json({
            message: "Login successful.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error("Login error:", err.message || err);
        res.status(500).json({ error: "An error occurred during login." });
    }
};

/**
 * Logout user
 */
const logout = (req, res) => {
    res.status(200).json({ message: "Logout successful." });
};

module.exports = { register, login, logout };
