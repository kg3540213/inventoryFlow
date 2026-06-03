import Decimal from 'decimal.js';

const CONVERSION_FACTORS = {
  weight: {
    'g': new Decimal(1),
    'kg': new Decimal(1000)
  },
  volume: {
    'mL': new Decimal(1),
    'L': new Decimal(1000)
  },
  count: {
    'items': new Decimal(1)
  }
};

export const convertToBaseUnit = (quantity, fromUnit, dimension) => {
  const q = new Decimal(quantity);
  const factor = CONVERSION_FACTORS[dimension]?.[fromUnit];
  if (!factor) throw new Error(`Invalid unit ${fromUnit}`);
  return q.times(factor);
};

export const convertFromBaseUnit = (baseQuantity, toUnit, dimension) => {
  const q = new Decimal(baseQuantity);
  const factor = CONVERSION_FACTORS[dimension]?.[toUnit];
  if (!factor) throw new Error(`Invalid unit ${toUnit}`);
  return q.dividedBy(factor);
};

export const calculatePrice = (basePrice, quantity, unit, dimension) => {
  const price = new Decimal(basePrice);
  const qty = new Decimal(quantity);
  const factor = CONVERSION_FACTORS[dimension]?.[unit];
  if (!factor) throw new Error(`Invalid unit ${unit}`);
  const pricePerUnit = price.times(factor);
  return qty.times(pricePerUnit);
};

export const getSupportedUnits = (dimension) => {
  return Object.keys(CONVERSION_FACTORS[dimension] || {});
};

export const formatPrice = (price) => {
  const p = new Decimal(price);
  return `₹ ${p.toFixed(2)}`;
};

export const formatQuantity = (quantity, unit) => {
  const q = new Decimal(quantity);
  return `${q.toString()} ${unit}`;
};
