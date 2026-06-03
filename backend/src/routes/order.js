const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Seller creates order
router.post('/', authenticate, createOrder);

// Both seller and admin can view orders
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

// Only admin can update order status
router.put('/:id/status', authenticate, authorize(['admin']), updateOrderStatus);

module.exports = router;
