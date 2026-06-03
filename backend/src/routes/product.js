const express = require('express');
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  getProductPricing 
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Anyone can view products
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/pricing', getProductPricing);

// Only admin can create, update, delete products
router.post('/', authenticate, authorize(['admin']), createProduct);
router.put('/:id', authenticate, authorize(['admin']), updateProduct);
router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

module.exports = router;
