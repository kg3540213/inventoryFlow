const Order = require('../models/Order');
const Product = require('../models/Product');
const { 
  calculatePrice, 
  getPricePerUnit,
  Decimal 
} = require('../utils/unitConversion');

const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }
    
    // Fetch products and validate items
    const orderItems = [];
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
      
      orderItems.push({
        product: product._id,
        quantity: new Decimal(quantity),
        unit,
        pricePerUnit: new Decimal(pricePerUnit),
        totalPrice: new Decimal(itemTotal)
      });
      
      totalAmount = totalAmount.plus(itemTotal);
    }
    
    const order = new Order({
      customer: req.userId,
      items: orderItems,
      totalAmount: new Decimal(totalAmount),
      deliveryAddress,
      notes
    });
    
    await order.save();
    await order.populate('customer', 'name email company');
    
    res.status(201).json({
      message: 'Order created successfully',
      order: formatOrderResponse(order)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, searchCustomer } = req.query;
    
    let query = {};
    
    // Sellers can only see their own orders
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
    
    const orders = await Order.find(query)
      .populate('customer', 'name email company')
      .populate('items.product', 'name sku dimension baseUnit')
      .sort({ createdAt: -1 });
    
    res.json({
      count: orders.length,
      orders: orders.map(formatOrderResponse)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email company address phone')
      .populate('items.product', 'name sku dimension baseUnit basePrice');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check authorization
    if (req.userRole === 'seller' && order.customer._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    res.json(formatOrderResponse(order));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Only admin can change order status
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update order status' });
    }
    
    order.status = status;
    if (status === 'confirmed' && !order.approvedBy) {
      order.approvedBy = req.userId;
      order.approvedAt = new Date();
    }
    
    await order.save();
    
    res.json({
      message: 'Order status updated successfully',
      order: formatOrderResponse(order)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const formatOrderResponse = (order) => {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    customer: order.customer,
    items: order.items.map(item => ({
      id: item._id,
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.totalPrice
    })),
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    approvedBy: order.approvedBy,
    approvedAt: order.approvedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
