const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../Controller/AuthController');

// Define routes with leading slashes
router.post('/user/register', register);
router.post('/user/login', login);
router.post('/user/logout', logout);

module.exports = router;
