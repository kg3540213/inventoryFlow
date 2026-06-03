require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const { Decimal } = require('decimal.js');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-system';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin User
    const admin = new User({
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
      company: 'Inventory Management Inc.',
      phone: '+91-9876543210'
    });
    await admin.save();
    console.log('✓ Admin user created:', admin.email);

    // Create Seller Users
    const seller1 = new User({
      name: 'Raj Kumar',
      email: 'seller@inventory.com',
      password: 'seller123',
      role: 'seller',
      company: 'Fresh Grains Co.',
      phone: '+91-9876543211'
    });
    await seller1.save();
    console.log('✓ Seller 1 created:', seller1.email);

    const seller2 = new User({
      name: 'Priya Singh',
      email: 'seller2@inventory.com',
      password: 'seller123',
      role: 'seller',
      company: 'Beverage Solutions Ltd.',
      phone: '+91-9876543212'
    });
    await seller2.save();
    console.log('✓ Seller 2 created:', seller2.email);

    // Create Sample Products
    const products = [
      // Weight-based products
      {
        name: 'Basmati Rice',
        description: 'Premium long-grain basmati rice from India',
        sku: 'RICE-001',
        category: 'Grains & Cereals',
        dimension: 'weight',
        baseQuantity: new Decimal(1000),
        baseUnit: 'g',
        basePrice: new Decimal(80),
        createdBy: admin._id
      },
      {
        name: 'Whole Wheat Flour',
        description: 'Freshly milled whole wheat flour',
        sku: 'FLOUR-001',
        category: 'Grains & Cereals',
        dimension: 'weight',
        baseQuantity: new Decimal(500),
        baseUnit: 'g',
        basePrice: new Decimal(40),
        createdBy: admin._id
      },
      {
        name: 'Organic Sugar',
        description: 'Pure organic sugar crystals',
        sku: 'SUGAR-001',
        category: 'Sweeteners',
        dimension: 'weight',
        baseQuantity: new Decimal(1000),
        baseUnit: 'g',
        basePrice: new Decimal(55),
        createdBy: admin._id
      },
      {
        name: 'Premium Tea Leaves',
        description: 'High-quality Assam tea leaves',
        sku: 'TEA-001',
        category: 'Beverages',
        dimension: 'weight',
        baseQuantity: new Decimal(250),
        baseUnit: 'g',
        basePrice: new Decimal(200),
        createdBy: admin._id
      },
      // Volume-based products
      {
        name: 'Pure Mustard Oil',
        description: 'Cold-pressed mustard oil for cooking',
        sku: 'OIL-001',
        category: 'Cooking Oils',
        dimension: 'volume',
        baseQuantity: new Decimal(1000),
        baseUnit: 'mL',
        basePrice: new Decimal(12),
        createdBy: admin._id
      },
      {
        name: 'Coconut Oil',
        description: 'Virgin coconut oil from fresh coconuts',
        sku: 'OIL-002',
        category: 'Cooking Oils',
        dimension: 'volume',
        baseQuantity: new Decimal(500),
        baseUnit: 'mL',
        basePrice: new Decimal(15),
        createdBy: admin._id
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed organic orange juice',
        sku: 'JUICE-001',
        category: 'Beverages',
        dimension: 'volume',
        baseQuantity: new Decimal(1000),
        baseUnit: 'mL',
        basePrice: new Decimal(8),
        createdBy: admin._id
      },
      {
        name: 'Apple Cider Vinegar',
        description: 'Unfiltered raw apple cider vinegar',
        sku: 'VINEGAR-001',
        category: 'Condiments',
        dimension: 'volume',
        baseQuantity: new Decimal(750),
        baseUnit: 'mL',
        basePrice: new Decimal(5),
        createdBy: admin._id
      },
      // Count-based products
      {
        name: 'Farm Fresh Eggs (Pack of 12)',
        description: 'Fresh eggs from free-range chickens',
        sku: 'EGGS-001',
        category: 'Dairy & Eggs',
        dimension: 'count',
        baseQuantity: new Decimal(12),
        baseUnit: 'items',
        basePrice: new Decimal(60),
        createdBy: admin._id
      },
      {
        name: 'Organic Tomatoes (Per Kg)',
        description: 'Fresh organic tomatoes',
        sku: 'TOMATO-001',
        category: 'Vegetables',
        dimension: 'count',
        baseQuantity: new Decimal(1),
        baseUnit: 'items',
        basePrice: new Decimal(50),
        createdBy: admin._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✓ ${createdProducts.length} products created`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('SEED DATA CREATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\nAdmin Credentials:');
    console.log('  Email: admin@inventory.com');
    console.log('  Password: admin123');
    console.log('\nSeller Credentials:');
    console.log('  Email: seller@inventory.com');
    console.log('  Password: seller123');
    console.log('\nProducts Created:');
    createdProducts.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} (${p.basePrice} ₹/${p.baseUnit})`);
    });
    console.log('\n' + '='.repeat(60));

    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
