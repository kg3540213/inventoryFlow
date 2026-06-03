const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
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

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
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
    items: [quotationItemSchema],
    
    // Total quotation value (in INR)
    totalAmount: {
      type: mongoose.Decimal128,
      required: true,
      get: (val) => val ? val.toString() : '0'
    },
    
    // Quotation status: 'pending', 'approved', 'rejected', 'expired'
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending'
    },
    
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
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
    
    // Link to order if quotation was converted to order
    convertedToOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
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

// Auto-generate quotation number
quotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    this.quotationNumber = `QUOT-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
