const mongoose = require('mongoose');

/**
 * Product Model - Stores product information
 * 
 * Unit Storage Strategy:
 * - All products store quantity in a BASE UNIT per dimension
 * - Weight dimension: base unit is grams (g)
 * - Volume dimension: base unit is milliliters (mL)
 * - Count dimension: base unit is items (1 item = 1 unit)
 * 
 * Pricing Strategy:
 * - Base price is per base unit (e.g., price per gram, price per mL, price per item)
 * - Stored as Decimal to ensure precision
 * - INR currency
 * 
 * Example: 1kg flour
 * - Internal storage: quantity: 1000 (grams), quantityUnit: "g", dimension: "weight"
 * - Base price: 50 (per gram) = 50 INR per gram
 * - When user orders 500g: 500 * 50 = 25000 INR
 * - When displayed as 0.5kg: 0.5 * 1000 * 50 = 25000 INR
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    
    // Storage dimension: 'weight', 'volume', 'count'
    dimension: {
      type: String,
      enum: ['weight', 'volume', 'count'],
      required: true
    },
    
    // Base quantity stored in base unit (g for weight, mL for volume, items for count)
    baseQuantity: {
      type: mongoose.Decimal128,
      required: true,
      get: (val) => val ? val.toString() : '0'
    },
    
    // Base unit: 'g', 'mL', or 'items'
    baseUnit: {
      type: String,
      enum: ['g', 'mL', 'items'],
      required: true
    },
    
    // Base price per unit (in INR) - stored as string for precision
    // Using Decimal128 for high precision
    basePrice: {
      type: mongoose.Decimal128,
      required: true,
      get: (val) => val ? val.toString() : '0'
    },
    
    // Current stock level
    stock: {
      type: mongoose.Decimal128,
      default: 0,
      get: (val) => val ? val.toString() : '0'
    },
    
    // User who created this product (admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

module.exports = mongoose.model('Product', productSchema);
