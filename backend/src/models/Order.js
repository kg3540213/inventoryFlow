const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Quantity in the selected unit by customer
  quantity: {
    type: mongoose.Decimal128,
    required: true,
    get: (val) => val ? val.toString() : '0'
  },
  // Unit selected by customer: 'g', 'kg', 'mL', 'L', 'items'
  unit: {
    type: String,
    enum: ['g', 'kg', 'mL', 'L', 'items'],
    required: true
  },
  // Price per unit of selected unit (in INR)
  pricePerUnit: {
    type: mongoose.Decimal128,
    required: true,
    get: (val) => val ? val.toString() : '0'
  },
  // Total price for this item
  totalPrice: {
    type: mongoose.Decimal128,
    required: true,
    get: (val) => val ? val.toString() : '0'
  }
}, { _id: true, toJSON: { getters: true }, toObject: { getters: true } });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    
    // Total order value (in INR)
    totalAmount: {
      type: mongoose.Decimal128,
      required: true,
      get: (val) => val ? val.toString() : '0'
    },
    
    // Order status: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    
    notes: {
      type: String,
      trim: true
    },
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    approvedAt: Date
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
