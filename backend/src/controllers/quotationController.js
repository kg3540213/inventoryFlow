const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { 
  calculatePrice, 
  convertToBaseUnit,
  getPricePerUnit,
  Decimal 
} = require('../utils/unitConversion');

const createQuotation = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }
    
    // Fetch products and validate items
    const quotationItems = [];
    let totalAmount = new Decimal(0);
    
    for (const item of items) {
      const { productId, quantity, unit } = item;
      
      if (!productId || quantity === undefined || !unit) {
        return res.status(400).json({ error: 'Each item must have productId, quantity, and unit' });
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${productId} not found` });
      }
      
      // Calculate price for this item
      const itemTotal = calculatePrice(product.basePrice, quantity, unit, product.dimension);
      const pricePerUnit = getPricePerUnit(product.basePrice, unit, product.dimension);
      
      quotationItems.push({
        product: product._id,
        quantity: new Decimal(quantity),
        unit,
        pricePerUnit: new Decimal(pricePerUnit),
        totalPrice: new Decimal(itemTotal)
      });
      
      totalAmount = totalAmount.plus(itemTotal);
    }
    
    // Generate unique quotation number
    const quotationNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const quotation = new Quotation({
      quotationNumber,
      customer: req.userId,
      items: quotationItems,
      totalAmount: new Decimal(totalAmount),
      deliveryAddress,
      notes
    });
    
    await quotation.save();
    await quotation.populate('customer', 'name email company');
    
    res.status(201).json({
      message: 'Quotation created successfully',
      quotation: formatQuotationResponse(quotation)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuotations = async (req, res) => {
  try {
    const { status, searchCustomer } = req.query;
    
    let query = {};
    
    // Sellers can only see their own quotations
    if (req.userRole === 'seller') {
      query.customer = req.userId;
    }
    
    // Admin can filter by status or customer
    if (status) {
      query.status = status;
    }
    
    if (searchCustomer && req.userRole === 'admin') {
      const customers = await require('../models/User').find({
        $or: [
          { name: { $regex: searchCustomer, $options: 'i' } },
          { email: { $regex: searchCustomer, $options: 'i' } }
        ]
      }).select('_id');
      query.customer = { $in: customers.map(c => c._id) };
    }
    
    const quotations = await Quotation.find(query)
      .populate('customer', 'name email company')
      .populate('items.product', 'name sku dimension baseUnit')
      .sort({ createdAt: -1 });
    
    res.json({
      count: quotations.length,
      quotations: quotations.map(formatQuotationResponse)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email company address phone')
      .populate('items.product', 'name sku dimension baseUnit basePrice');
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Check authorization
    if (req.userRole === 'seller' && quotation.customer._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this quotation' });
    }
    
    res.json(formatQuotationResponse(quotation));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Only admin can approve
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can approve quotations' });
    }
    
    quotation.status = 'approved';
    quotation.approvedBy = req.userId;
    quotation.approvedAt = new Date();
    
    await quotation.save();
    
    res.json({
      message: 'Quotation approved successfully',
      quotation: formatQuotationResponse(quotation)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Only admin can reject
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can reject quotations' });
    }
    
    quotation.status = 'rejected';
    quotation.approvedBy = req.userId;
    quotation.approvedAt = new Date();
    
    await quotation.save();
    
    res.json({
      message: 'Quotation rejected successfully',
      quotation: formatQuotationResponse(quotation)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const convertQuotationToOrder = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Check authorization
    if (quotation.customer.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to convert this quotation' });
    }
    
    if (quotation.status !== 'approved') {
      return res.status(400).json({ error: 'Can only convert approved quotations to orders' });
    }
    
    // Create order from quotation
    const order = new Order({
      customer: quotation.customer,
      items: quotation.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.totalPrice
      })),
      totalAmount: quotation.totalAmount,
      deliveryAddress: quotation.deliveryAddress,
      notes: quotation.notes,
      status: 'pending'
    });
    
    await order.save();
    
    // Link quotation to order
    quotation.convertedToOrder = order._id;
    quotation.status = 'approved'; // Keep it approved, but linked to order
    await quotation.save();
    
    res.status(201).json({
      message: 'Quotation converted to order successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const formatQuotationResponse = (quotation) => {
  return {
    id: quotation._id,
    quotationNumber: quotation.quotationNumber,
    customer: quotation.customer,
    items: quotation.items.map(item => ({
      id: item._id,
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.totalPrice
    })),
    totalAmount: quotation.totalAmount,
    status: quotation.status,
    validUntil: quotation.validUntil,
    deliveryAddress: quotation.deliveryAddress,
    notes: quotation.notes,
    convertedToOrder: quotation.convertedToOrder,
    approvedBy: quotation.approvedBy,
    approvedAt: quotation.approvedAt,
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt
  };
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  approveQuotation,
  rejectQuotation,
  convertQuotationToOrder
};
