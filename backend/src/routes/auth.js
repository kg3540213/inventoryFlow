const express = require('express');
const { register, login, verifyToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', authenticate, verifyToken);

module.exports = router;
