const Decimal = require('decimal.js');

// Conversion factors to base units
const CONVERSION_FACTORS = {
  weight: {
    'g': new Decimal(1),        // gram is base unit
    'kg': new Decimal(1000)      // 1 kg = 1000 g
  },
  volume: {
    'mL': new Decimal(1),        // milliliter is base unit
    'L': new Decimal(1000)       // 1 L = 1000 mL
  },
  count: {
    'items': new Decimal(1)      // item is base unit
  }
};

/**
 * Convert quantity from any unit to base unit
 * @param {string|number} quantity - Quantity value
 * @param {string} fromUnit - Source unit (g, kg, mL, L, items)
 * @param {string} dimension - Dimension (weight, volume, count)
 * @returns {Decimal} Quantity in base unit
 */
const convertToBaseUnit = (quantity, fromUnit, dimension) => {
  const q = new Decimal(quantity);
  const factor = CONVERSION_FACTORS[dimension]?.[fromUnit];
  
  if (!factor) {
    throw new Error(`Invalid unit ${fromUnit} for dimension ${dimension}`);
  }
  
  return q.times(factor);
};

/**
 * Convert quantity from base unit to target unit
 * @param {string|number} baseQuantity - Quantity in base unit
 * @param {string} toUnit - Target unit
 * @param {string} dimension - Dimension
 * @returns {Decimal} Quantity in target unit
 */
const convertFromBaseUnit = (baseQuantity, toUnit, dimension) => {
  const q = new Decimal(baseQuantity);
  const factor = CONVERSION_FACTORS[dimension]?.[toUnit];
  
  if (!factor) {
    throw new Error(`Invalid unit ${toUnit} for dimension ${dimension}`);
  }
  
  return q.dividedBy(factor);
};

/**
 * Calculate price for a given quantity in a specific unit
 * @param {string|number} basePrice - Base price per base unit (in INR)
 * @param {string|number} quantity - Quantity in selected unit
 * @param {string} unit - Selected unit
 * @param {string} dimension - Dimension
 * @returns {Decimal} Total price in INR
 */
const calculatePrice = (basePrice, quantity, unit, dimension) => {
  const price = new Decimal(basePrice);
  const qty = new Decimal(quantity);
  const factor = CONVERSION_FACTORS[dimension]?.[unit];
  
  if (!factor) {
    throw new Error(`Invalid unit ${unit} for dimension ${dimension}`);
  }
  
  // Price per selected unit = base price * factor
  // Total price = price per selected unit * quantity
  const pricePerUnit = price.times(factor);
  return qty.times(pricePerUnit);
};

/**
 * Get price per unit in a specific unit
 * @param {string|number} basePrice - Base price per base unit
 * @param {string} unit - Target unit
 * @param {string} dimension - Dimension
 * @returns {Decimal} Price per unit in target unit
 */
const getPricePerUnit = (basePrice, unit, dimension) => {
  const price = new Decimal(basePrice);
  const factor = CONVERSION_FACTORS[dimension]?.[unit];
  
  if (!factor) {
    throw new Error(`Invalid unit ${unit} for dimension ${dimension}`);
  }
  
  return price.times(factor);
};

/**
 * Get supported units for a dimension
 * @param {string} dimension - Dimension (weight, volume, count)
 * @returns {string[]} Array of supported units
 */
const getSupportedUnits = (dimension) => {
  return Object.keys(CONVERSION_FACTORS[dimension] || {});
};

/**
 * Get base unit for a dimension
 * @param {string} dimension - Dimension
 * @returns {string} Base unit
 */
const getBaseUnit = (dimension) => {
  switch(dimension) {
    case 'weight': return 'g';
    case 'volume': return 'mL';
    case 'count': return 'items';
    default: throw new Error(`Unknown dimension: ${dimension}`);
  }
};

/**
 * Format price as INR
 * @param {string|number|Decimal} price - Price value
 * @returns {string} Formatted price string
 */
const formatPrice = (price) => {
  const p = new Decimal(price);
  return `₹ ${p.toFixed(2)}`;
};

/**
 * Format quantity with unit
 * @param {string|number|Decimal} quantity - Quantity value
 * @param {string} unit - Unit
 * @returns {string} Formatted quantity string
 */
const formatQuantity = (quantity, unit) => {
  const q = new Decimal(quantity);
  return `${q.toString()} ${unit}`;
};

module.exports = {
  convertToBaseUnit,
  convertFromBaseUnit,
  calculatePrice,
  getPricePerUnit,
  getSupportedUnits,
  getBaseUnit,
  formatPrice,
  formatQuantity,
  CONVERSION_FACTORS,
  Decimal
};
