# Inventory and Order Management System

A full-stack web application for managing inventory, creating quotations, and processing orders with support for multiple units of measurement and precise decimal calculations.

**Live URLs:** *(To be deployed)*
- Frontend: [Coming soon]
- Backend API: [Coming soon]

---

## 📋 Project Overview

### Features & Objectives

1. **Product Management**: Create and manage products with flexible unit measurements (g, kg, mL, L, items)
2. **Inventory Tracking**: Track stock levels in base units
3. **Unit Conversion**: Seamless conversion between compatible units (g ↔ kg, mL ↔ L)
4. **Quotation System**: Create and manage quotations with flexible unit selection
5. **Order Management**: Convert approved quotations to orders and track status
6. **Role-Based Access**: Admin and Seller roles with appropriate permissions
7. **Decimal Precision**: High-precision calculations using Decimal.js to avoid floating-point errors

### User Roles & Permissions

#### Admin Role
- Create, read, update, delete products
- Set base prices and quantities
- View all quotations and orders
- Approve or reject quotations
- Update order status

#### Seller/User Role
- Browse and search products
- View product pricing in all supported units
- Create quotations with flexible unit selection
- View their own quotations and orders
- Convert approved quotations to orders
- Manage delivery address for orders

---

## 🏗️ Tech Stack & Architecture

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Precision Calculations**: Decimal.js (matching backend precision)
- **State Management**: React Context API
- **Styling**: Inline CSS (for simplicity)

### Backend
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing
- **Precision Calculations**: Decimal.js
- **Validation**: express-validator
- **CORS**: Enabled for frontend communication

### Database
- **MongoDB**: NoSQL document database

### Key Libraries
- `decimal.js`: High-precision arithmetic
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `mongoose`: MongoDB ODM

---

## 📊 Database Design

### Collections & Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: 'admin', 'seller', default: 'seller'),
  company: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  sku: String (unique, optional),
  category: String,
  
  // Unit Dimension: 'weight', 'volume', 'count'
  dimension: String (enum: 'weight', 'volume', 'count', required),
  
  // Base quantity in base unit (stored as Decimal128)
  baseQuantity: Decimal128 (required),
  
  // Base unit for dimension
  baseUnit: String (enum: 'g', 'mL', 'items', required),
  
  // Base price per unit (stored as Decimal128 for precision)
  basePrice: Decimal128 (required),
  
  // Current stock level
  stock: Decimal128 (default: 0),
  
  createdBy: ObjectId (ref: User),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Quotations Collection
```javascript
{
  _id: ObjectId,
  quotationNumber: String (auto-generated, unique),
  customer: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Decimal128 (customer's selected unit),
      unit: String (enum: 'g', 'kg', 'mL', 'L', 'items'),
      pricePerUnit: Decimal128,
      totalPrice: Decimal128
    }
  ],
  totalAmount: Decimal128 (sum of all items),
  status: String (enum: 'pending', 'approved', 'rejected', 'expired', default: 'pending'),
  validUntil: Date (default: 7 days from creation),
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String,
  convertedToOrder: ObjectId (ref: Order, if converted),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (auto-generated, unique),
  customer: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Decimal128,
      unit: String,
      pricePerUnit: Decimal128,
      totalPrice: Decimal128
    }
  ],
  totalAmount: Decimal128,
  status: String (enum: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', default: 'pending'),
  deliveryAddress: { ... },
  notes: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Data Types & Precision Strategy

**Why Decimal128 for MongoDB?**
- Handles high-precision decimal arithmetic
- Avoids floating-point errors common with IEEE 754 doubles
- Suitable for financial/inventory calculations

**Numeric Fields:**
- Prices: Decimal128 (stored as Decimal in Decimal.js during transit)
- Quantities: Decimal128 (all calculations done with Decimal.js)
- Stock levels: Decimal128

---

## 🔄 Unit Conversion & Storage Strategy

### Dimension-Based Storage

Products are organized by **dimension**: weight, volume, or count.

#### Weight Dimension
- **Base Unit**: Grams (g)
- **Supported Units**: g (grams), kg (kilograms)
- **Conversion**: 1 kg = 1000 g

#### Volume Dimension
- **Base Unit**: Milliliters (mL)
- **Supported Units**: mL (milliliters), L (liters)
- **Conversion**: 1 L = 1000 mL

#### Count Dimension
- **Base Unit**: Items
- **Supported Units**: items (unit count)
- **Conversion**: 1 item = 1 unit

### Storage & Conversion Flow

**Example 1: 2 kg flour at ₹50 per gram**

1. **Product Creation (Admin)**
   ```
   Input: 2 kg flour at ₹50/gram
   Stored: baseQuantity = 2000 (g), baseUnit = "g", basePrice = 50 (per g)
   ```

2. **Customer Orders in Different Unit**
   ```
   Customer wants: 500g flour
   Calculation: 500 × 50 = ₹25,000
   ```

3. **Customer Orders in kg**
   ```
   Customer wants: 0.5 kg flour
   Conversion: 0.5 kg → 500 g (internal)
   Calculation: 500 × 50 = ₹25,000
   ```

### Conversion Logic

**In Backend** (`src/utils/unitConversion.js`):
```javascript
// Convert from any unit to base unit (for storage)
convertToBaseUnit(quantity, fromUnit, dimension)
  → Returns quantity in base unit

// Get price per any unit (for display)
getPricePerUnit(basePrice, unit, dimension)
  → Returns price for 1 unit in target unit

// Calculate total price
calculatePrice(basePrice, quantity, unit, dimension)
  → Returns total cost
```

**In Frontend** (`src/utils.js`):
- Mirror functions for UI calculations
- Uses Decimal.js for consistency with backend

### Where Conversions Apply

1. **Before Display**: Show prices per user-selected unit
2. **Before Calculation**: Convert quantities to base units
3. **Before Storage**: All calculations done in base units
4. **During API Responses**: Include pricing for all supported units

### Example Calculation

**Product**: 5L milk at ₹20/mL

```
baseQuantity: 5000 (mL)
baseUnit: "mL"
basePrice: 20 (per mL)

Customer orders: 2L
↓
Convert to base: 2 × 1000 = 2000 mL
↓
Calculate price: 2000 × 20 = ₹40,000
↓
Price per unit: 20 × 1000 = ₹20,000 per L
```

---

## 💰 Pricing & Precision Handling

### Price Storage
- Stored as **Decimal128** in MongoDB
- Transmitted as string in JSON (preserves precision)
- Calculations done with **Decimal.js** library

### Rounding Rules
- Display: 2 decimal places (₹X.XX)
- Internal calculations: Full precision
- No rounding during intermediate calculations

### Example Flow
```
Product: 1kg sugar at ₹33.33/gram
Customer orders: 345g
Calculation:
  basePrice = 33.33
  quantity = 345
  unit = "g"
  price = 33.33 × 345 = 11,498.85 ₹
Display: ₹11,498.85
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js v16+ and npm
- MongoDB v4.4+
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd assignment
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/inventory-system
# JWT_SECRET=your_secret_key_here
# PORT=5000
# FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name inventory-db mongo:latest
```

### Step 4: Start Backend Server

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Step 5: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (usually no changes needed for local development)
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 6: Start Frontend

```bash
cd frontend
npm start
# Opens at http://localhost:3000
```

---

## 🔐 Test Credentials

Use these credentials to test the application:

### Admin Account
```
Email: admin@inventory.com
Password: admin123
(Create via registration or seed the database)
```

### Seller Account
```
Email: seller@inventory.com
Password: seller123
(Create via registration or seed the database)
```

---

## 📖 Usage Guide

### Step 1: Registration

1. Navigate to `/register`
2. Fill in details:
   - Name
   - Email
   - Password
   - Company (optional)
   - Role (Admin or Seller)
3. Click Register

### Step 2: Login

1. Navigate to `/login`
2. Enter email and password
3. Redirects to Admin Panel (if admin) or Seller Panel (if seller)

### Step 3: Admin - Create Products

1. Go to Admin Panel → Products tab
2. Fill in product details:
   - **Name**: Product name
   - **SKU**: Unique identifier (optional)
   - **Category**: Product category
   - **Dimension**: Choose weight/volume/count
   - **Base Quantity**: Amount (in base unit)
   - **Base Price**: Price per base unit (₹)
   - **Description**: Product details
3. Click "Create Product"

**Example Product Creation:**
- Name: "Basmati Rice"
- SKU: "RICE-001"
- Category: "Grains"
- Dimension: "Weight"
- Base Quantity: 1000 (grams)
- Base Price: 80 (₹ per gram)

### Step 4: Seller - Browse Products

1. Login as Seller
2. Go to Products page
3. Search by name/SKU or filter by dimension
4. View pricing for all supported units

### Step 5: Seller - Create Quotation

1. Go to Seller Panel → Quotation Management
2. Select a product
3. Enter quantity in desired unit
4. Click "Add to Cart"
5. Repeat for more items
6. Click "View Cart"
7. Review cart and enter delivery address
8. Click "Create Quotation"

**Example Quotation:**
```
Product: Basmati Rice (1000g @ ₹80/g)
Order 1: 2.5kg = 2500g × 80 = ₹200,000
Order 2: 500g × 80 = ₹40,000
Total: ₹240,000
```

### Step 6: Admin - Approve Quotations

1. Go to Admin Panel → Quotations tab
2. Review pending quotations
3. Click "View Details" to see item breakdown
4. Click "Approve" or "Reject"

### Step 7: Seller - Convert Quotation to Order

1. Go to Seller Panel
2. Find approved quotation
3. Click "Convert to Order"
4. Order is created with "pending" status

### Step 8: Admin - Manage Orders

1. Go to Admin Panel
2. View all orders
3. Update order status: pending → confirmed → shipped → delivered

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/pricing` - Get pricing in all units
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Quotations
- `GET /api/quotations` - Get quotations (own for sellers, all for admin)
- `GET /api/quotations/:id` - Get quotation details
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations/:id/approve` - Approve quotation (Admin only)
- `PUT /api/quotations/:id/reject` - Reject quotation (Admin only)
- `POST /api/quotations/:id/convert-to-order` - Convert to order

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/profile` - Update own profile
- `DELETE /api/users/:id` - Deactivate user (Admin only)

---

## 🌐 Deployment Instructions

### Backend Deployment (Heroku/Railway/Render)

1. **Create `.env` for production:**
   ```
   MONGODB_URI=<your-mongodb-atlas-url>
   JWT_SECRET=<strong-random-secret>
   NODE_ENV=production
   FRONTEND_URL=<your-frontend-url>
   PORT=5000
   ```

2. **Deploy using Git (Heroku example):**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

3. **Or Docker:**
   ```bash
   docker build -t inventory-backend .
   docker run -p 5000:5000 -e MONGODB_URI=<url> inventory-backend
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build production bundle:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Or deploy to Netlify:**
   ```bash
   npm run build
   # Deploy the `build` folder to Netlify
   ```

### MongoDB Setup

Use **MongoDB Atlas** for cloud hosting:
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and database
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/inventory-system`
4. Add to backend `.env` as `MONGODB_URI`

---

## 📝 Security Practices

✅ **Implemented:**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization middleware
- CORS protection
- Environment variables for secrets
- Input validation (express-validator ready)

⚠️ **For Production:**
- Use HTTPS/TLS
- Implement rate limiting
- Add request validation
- Use environment-specific secrets
- Regular security audits
- Implement logging/monitoring

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
```bash
# Check MongoDB is running
# Windows: mongod
# Mac: brew services start mongodb-community
# Docker: docker start inventory-db

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/inventory-system
```

### Frontend API calls fail
```bash
# Check backend is running on port 5000
# Check .env REACT_APP_API_URL is correct
# Check CORS settings in backend/src/index.js
```

### Unit conversion issues
- Verify `dimension` matches supported dimensions (weight, volume, count)
- Check `baseUnit` is correct for dimension
- Ensure quantities are numeric strings (e.g., "100" not "100g")

---

## 📚 Project Structure

```
assignment/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   └── Quotation.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── quotationController.js
│   │   │   ├── orderController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── product.js
│   │   │   ├── quotation.js
│   │   │   ├── order.js
│   │   │   └── user.js
│   │   ├── utils/unitConversion.js
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── context/AuthContext.js
│   │   ├── components/Layout.js
│   │   ├── pages/
│   │   │   ├── Auth.js
│   │   │   ├── ProductBrowser.js
│   │   │   ├── QuotationFlow.js
│   │   │   └── AdminPanel.js
│   │   ├── api.js
│   │   ├── utils.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/feature-name`
4. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## ✉️ Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Last Updated**: June 2026  
**Version**: 1.0.0
