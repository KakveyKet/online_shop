// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dynamicRoute = require('./routes/dynamicRoutes')
const authRoute = require('./routes/userRoutes')
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
app.use(cors()); // Allow all origins or configure as needed

// Middleware to parse JSON
app.use(express.json());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Simple GET route for '/'
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Use user routes
app.use('/api', dynamicRoute);
app.use('/api', authRoute);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
