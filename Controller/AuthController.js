const nodemailer = require("nodemailer"); // Import nodemailer
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyToken, hashPassword } = require('./authHelper');
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

const sendResetEmail = async (email, name, resetToken) => {
    console.log("Reset token in sendResetEmail:", resetToken); // Log the token for debugging

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log("Reset link:", resetLink); // Log the reset link for debugging

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f8f8; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Password Reset</h1>
                  <p style="margin-bottom: 15px;">Hello ${name},</p>
                  <p style="margin-bottom: 20px;">You requested a password reset. Click the button below to reset your password:</p>
                  <div style="text-align: center; margin-bottom: 25px;">
                      <a href="${resetLink}" style="display: inline-block; background-color: #3498db; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Reset Password</a>
                  </div>
                  <p style="margin-bottom: 15px;">If you did not request this, please ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
                  <p style="font-size: 12px; color: #777777; text-align: center;">This is an automated email. Please do not reply.</p>
              </div>
          </body>
        `,
    };

    await transporter.sendMail(mailOptions);
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.resetToken !== crypto.createHash('sha256').update(token).digest('hex')) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }
        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        user.resetToken = null; // Clear the reset token
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err.message || err);
        res.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
};


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // Find the user by email and update the reset token
        const user = await User.findOneAndUpdate(
            { email }, // Find the user by email
            { $set: { resetToken: null } }, // Clear any existing reset token
            { new: true } // Return the updated user document
        );

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log("Generated reset token:", resetToken); // Log the generated token for debugging

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Update the user with the hashed token
        user.resetToken = hashedToken;
        await user.save();

        // Send the reset email
        await sendResetEmail(user.email, user.name, resetToken);

        res.status(200).json({ message: "Password reset email sent successfully." });

    } catch (err) {
        console.error("Forget password error:", err.message || err);
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
};



module.exports = { register, login, logout, forgetPassword, resetPassword, sendResetEmail };
