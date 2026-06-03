const Product = require('../models/Product');
const { 
  convertToBaseUnit, 
  convertFromBaseUnit, 
  getPricePerUnit, 
  getSupportedUnits,
  getBaseUnit,
  Decimal 
} = require('../utils/unitConversion');

const createProduct = async (req, res) => {
  try {
    const { name, description, sku, category, dimension, baseQuantity, baseUnit, basePrice } = req.body;
    
    // Validate input
    if (!name || !dimension || baseQuantity === undefined || !baseUnit || basePrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate dimension
    if (!['weight', 'volume', 'count'].includes(dimension)) {
      return res.status(400).json({ error: 'Invalid dimension. Must be weight, volume, or count' });
    }
    
    // Validate unit matches dimension
    const supportedUnits = getSupportedUnits(dimension);
    if (!supportedUnits.includes(baseUnit)) {
      return res.status(400).json({ error: `Invalid unit ${baseUnit} for dimension ${dimension}` });
    }
    
    // Check for duplicate SKU
    if (sku) {
      const existing = await Product.findOne({ sku });
      if (existing) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
    }
    
    const product = new Product({
      name,
      description,
      sku,
      category,
      dimension,
      baseQuantity: new Decimal(baseQuantity),
      baseUnit,
      basePrice: new Decimal(basePrice),
      createdBy: req.userId
    });
    
    await product.save();
    
    res.status(201).json({
      message: 'Product created successfully',
      product: formatProductResponse(product)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, dimension } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (dimension) {
      query.dimension = dimension;
    }
    
    const products = await Product.find(query).populate('createdBy', 'name email company');
    
    res.json({
      count: products.length,
      products: products.map(formatProductResponse)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email company');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(formatProductResponse(product));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, category, baseQuantity, basePrice } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check authorization
    if (product.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }
    
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (baseQuantity !== undefined) product.baseQuantity = new Decimal(baseQuantity);
    if (basePrice !== undefined) product.basePrice = new Decimal(basePrice);
    
    await product.save();
    
    res.json({
      message: 'Product updated successfully',
      product: formatProductResponse(product)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check authorization - only admin or creator can delete
    if (product.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }
    
    product.isActive = false;
    await product.save();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pricing information for a product
 * Returns price per each supported unit
 */
const getProductPricing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const supportedUnits = getSupportedUnits(product.dimension);
    const pricing = {};
    
    supportedUnits.forEach(unit => {
      pricing[unit] = getPricePerUnit(product.basePrice, unit, product.dimension).toString();
    });
    
    res.json({
      productId: product._id,
      productName: product.name,
      dimension: product.dimension,
      basePrice: product.basePrice.toString(),
      baseUnit: product.baseUnit,
      pricing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Format product response with readable data
 */
const formatProductResponse = (product) => {
  const supportedUnits = getSupportedUnits(product.dimension);
  const pricing = {};
  
  supportedUnits.forEach(unit => {
    pricing[unit] = getPricePerUnit(product.basePrice, unit, product.dimension).toString();
  });
  
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    category: product.category,
    dimension: product.dimension,
    baseQuantity: product.baseQuantity,
    baseUnit: product.baseUnit,
    basePrice: product.basePrice,
    pricing,
    stock: product.stock,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductPricing
};
