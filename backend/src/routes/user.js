const express = require('express');
const { 
  getUsers, 
  getUserById, 
  updateUserProfile,
  deactivateUser
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user list (admin only)
router.get('/', authenticate, authorize(['admin']), getUsers);

// Get current user profile
router.get('/me', authenticate, (req, res) => {
  res.json({ userId: req.userId });
});

// Get user by ID
router.get('/:id', authenticate, getUserById);

// Update own profile
router.put('/:id/profile', authenticate, updateUserProfile);

// Deactivate user (admin only)
router.delete('/:id', authenticate, authorize(['admin']), deactivateUser);

module.exports = router;
