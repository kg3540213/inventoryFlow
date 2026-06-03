const express = require('express');
const { 
  createQuotation, 
  getQuotations, 
  getQuotationById,
  approveQuotation,
  rejectQuotation,
  convertQuotationToOrder
} = require('../controllers/quotationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Seller creates quotation
router.post('/', authenticate, createQuotation);

// Both seller and admin can view quotations
router.get('/', authenticate, getQuotations);
router.get('/:id', authenticate, getQuotationById);

// Seller converts approved quotation to order
router.post('/:id/convert-to-order', authenticate, convertQuotationToOrder);

// Only admin can approve or reject
router.put('/:id/approve', authenticate, authorize(['admin']), approveQuotation);
router.put('/:id/reject', authenticate, authorize(['admin']), rejectQuotation);

module.exports = router;
