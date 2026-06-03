# 📁 Project Structure - Inventory & Order Management System

Complete project structure and file descriptions.

---

## 📂 Root Directory

```
assignment/
├── .git/                          # Git version control
├── .gitignore                     # Git ignore rules
├── backend/                       # Express.js backend server
├── frontend/                      # React.js frontend application
├── README.md                      # Main project documentation
└── PATH.md                        # This file - Project structure guide
```

---

## 🔌 Backend (`/backend/`)

### Directory Structure

```
backend/
├── .env                           # Environment variables (PORT, MONGODB_URI, JWT_SECRET)
├── .gitignore                     # Ignore node_modules, .env, etc
├── package.json                   # Dependencies & npm scripts
├── package-lock.json              # Locked dependency versions
├── node_modules/                  # Installed dependencies
├── scripts/
│   └── seed.js                    # Database seeding script (creates test users & products)
└── src/
    ├── index.js                   # Main Express app entry point, server initialization
    ├── config/
    │   └── database.js            # MongoDB connection with Mongoose
    ├── middleware/
    │   └── auth.js                # JWT verification & role-based authorization
    ├── models/                    # Mongoose schemas
    │   ├── User.js                # User schema (email, password, role, company, address)
    │   ├── Product.js             # Product schema (name, dimension, basePrice, baseUnit, baseQuantity, stock)
    │   ├── Quotation.js           # Quotation schema (quotationNumber, items, totalAmount, status, validUntil)
    │   └── Order.js               # Order schema (customer, items, totalAmount, status, deliveryAddress)
    ├── controllers/               # Business logic & API handlers
    │   ├── authController.js      # Register, login, verifyToken, generateToken
    │   ├── productController.js   # CRUD operations for products (admin only)
    │   ├── quotationController.js # Create, approve, reject quotations, convert to order
    │   ├── orderController.js     # Create, view, update order status
    │   └── userController.js      # User profile & management (admin)
    ├── routes/                    # Express route definitions
    │   ├── auth.js                # POST /register, POST /login, GET /verify
    │   ├── product.js             # GET /, GET /:id, POST /, PUT /:id, DELETE /:id (admin)
    │   ├── quotation.js           # POST /, GET /, GET /:id, PUT /:id/approve, PUT /:id/reject
    │   ├── order.js               # POST /, GET /, GET /:id, PUT /:id/status
    │   └── user.js                # GET /, GET /me, GET /:id, PUT /:id/profile, DELETE /:id
    └── utils/
        └── unitConversion.js      # Unit conversion utilities using Decimal.js
                                   # Supports: g, kg (weight), mL, L (volume), items (count)
                                   # Functions: convertToBaseUnit, convertFromBaseUnit, calculatePrice
```

### Backend File Descriptions

| File | Purpose |
|------|---------|
| `index.js` | Initializes Express app, connects to MongoDB, sets up middleware, starts server on port 5000 |
| `database.js` | Mongoose connection with retry logic |
| `auth.js (middleware)` | Verifies JWT token, extracts userId & userRole, checks authorization |
| `authController.js` | User registration (bcrypt hashing), login (JWT token generation), token verification |
| `productController.js` | Create/read/update/delete products; get pricing in different units |
| `quotationController.js` | Create quotations from items; approve/reject by admin; convert to orders |
| `orderController.js` | Create orders; track order status (pending→confirmed→shipped→delivered) |
| `userController.js` | User profile management, list users, deactivate accounts |
| `unitConversion.js` | Core math: converts between units (g↔kg, mL↔L), calculates prices, uses Decimal.js |
| `User.js` | Schema: email, password (hashed), role (admin/seller), company, address, timestamps |
| `Product.js` | Schema: name, dimension (weight/volume/count), basePrice (Decimal128), baseUnit, baseQuantity, stock |
| `Quotation.js` | Schema: quotationNumber, customer ref, items array, totalAmount, status, validUntil, approvalTracking |
| `Order.js` | Schema: customer ref, items array (same as quotation), totalAmount, status, deliveryAddress, approvalTracking |
| `seed.js` | Creates: 1 admin user, 2 seller users, 10 sample products with realistic units/prices |

### Backend Routes Summary

| Method | Route | Auth | Role | Purpose |
|--------|-------|------|------|---------|
| POST | `/auth/register` | - | - | User registration (email, password, role, company) |
| POST | `/auth/login` | - | - | User login (returns JWT token) |
| GET | `/auth/verify` | ✓ | - | Verify token & get user info |
| POST | `/product` | ✓ | admin | Create product |
| GET | `/product` | ✓ | - | List all products (with search/filter) |
| GET | `/product/:id` | ✓ | - | Get product details & pricing |
| GET | `/product/:id/pricing` | ✓ | - | Get pricing breakdown in all units |
| PUT | `/product/:id` | ✓ | admin | Update product |
| DELETE | `/product/:id` | ✓ | admin | Delete product |
| POST | `/quotation` | ✓ | seller | Create quotation |
| GET | `/quotation` | ✓ | - | List quotations (sellers see own, admins see all) |
| GET | `/quotation/:id` | ✓ | - | Get quotation details |
| PUT | `/quotation/:id/approve` | ✓ | admin | Approve quotation |
| PUT | `/quotation/:id/reject` | ✓ | admin | Reject quotation |
| POST | `/quotation/:id/convert-to-order` | ✓ | admin | Convert approved quotation to order |
| POST | `/order` | ✓ | - | Create order directly |
| GET | `/order` | ✓ | - | List orders |
| GET | `/order/:id` | ✓ | - | Get order details |
| PUT | `/order/:id/status` | ✓ | admin | Update order status |
| GET | `/user` | ✓ | admin | List all users |
| GET | `/user/me` | ✓ | - | Get current user profile |
| GET | `/user/:id` | ✓ | admin | Get user details |
| PUT | `/user/:id/profile` | ✓ | - | Update user profile |
| DELETE | `/user/:id` | ✓ | admin | Deactivate user |

---

## 🎨 Frontend (`/frontend/`)

### Directory Structure

```
frontend/
├── .env                           # Environment variables (REACT_APP_API_URL)
├── .gitignore                     # Ignore node_modules, build, etc
├── package.json                   # Dependencies & npm scripts
├── package-lock.json              # Locked dependency versions
├── node_modules/                  # Installed dependencies
├── public/
│   └── index.html                 # HTML template with root div
└── src/
    ├── index.js                   # React DOM render entry point
    ├── App.js                     # Main router (protected routes based on auth & role)
    ├── api.js                     # Fetch-based API clients (authAPI, productAPI, quotationAPI, orderAPI)
    ├── utils.js                   # Unit conversion utilities (mirrors backend)
    ├── components/
    │   └── Layout.js              # Navigation bar, logout, main content wrapper
    ├── context/
    │   └── AuthContext.js         # AuthProvider, useAuth hook, JWT token management, localStorage persistence
    └── pages/
        ├── Auth.js                # Login & Register forms (tabs, form validation, error display)
        ├── ProductBrowser.js      # Browse products, search, filter by dimension, display pricing in all units
        ├── QuotationFlow.js       # Shopping cart, select products, flexible unit input, create quotation, view history
        └── AdminPanel.js          # Two tabs: Products (create form + table) & Quotations (approval interface)
```

### Frontend File Descriptions

| File | Purpose |
|------|---------|
| `index.js` | React DOM render to #root element in HTML |
| `App.js` | Main router: conditionally renders Login page or protected routes based on auth state & user role |
| `api.js` | Centralized API clients (authAPI, productAPI, quotationAPI, orderAPI) with Authorization header injection |
| `utils.js` | Frontend unit conversion mirrors backend implementation using Decimal.js |
| `Layout.js` | Reusable layout: nav bar with user info/logout button, main content area wrapper |
| `AuthContext.js` | React Context for authentication: login, register, logout, auto-verify token on mount, localStorage persistence |
| `Auth.js` | Two-tab page: Login form & Register form with validation, error display, redirect on success |
| `ProductBrowser.js` | Product listing with search box, dimension filter dropdown, view pricing in g/kg/mL/L/items |
| `QuotationFlow.js` | Shopping cart interface: select products, input quantity in desired unit, create quotation, view history with status |
| `AdminPanel.js` | Admin dashboard with two tabs: (1) Product management form & table, (2) Quotation approval modal interface |
| `index.html` | HTML template with meta tags, title, root div for React mounting |

### Frontend Pages Overview

| Page | Access | Components | Features |
|------|--------|-----------|----------|
| `Auth.js` | Unauth users | Login form, Register form | Email/password input, role selection, form validation |
| `ProductBrowser.js` | All users | Product list, search bar, filter | Search by name, filter by dimension, display in multiple units |
| `QuotationFlow.js` | Sellers | Shopping cart, quotation form | Add products, select units, quantity input, create quotation, view history |
| `AdminPanel.js` | Admin only | Product table, Quotation approver | Manage products (create/edit/delete), approve/reject quotations, detail modals |

---

## 📦 Dependencies

### Backend (`backend/package.json`)

```json
{
  "express": "^4.18.2",           // Web framework
  "mongoose": "^7.0.0",           // MongoDB ODM
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.0.0",       // JWT token generation
  "dotenv": "^16.0.3",            // Environment variables
  "decimal.js": "^10.4.3"         // High-precision math
}
```

### Frontend (`frontend/package.json`)

```json
{
  "react": "^18.2.0",             // UI library
  "react-dom": "^18.2.0",         // React DOM rendering
  "react-router-dom": "^6.11.0",  // Client-side routing
  "decimal.js": "^10.4.3"         // High-precision math (mirrors backend)
}
```

---

## 🗄️ Database

### MongoDB Collections

1. **users** - User accounts (admin, sellers)
   - Fields: email, password (hashed), role, company, address, createdAt, updatedAt

2. **products** - Inventory products
   - Fields: name, dimension, basePrice (Decimal128), baseUnit, baseQuantity, stock, isActive, createdAt, updatedAt

3. **quotations** - Quotation requests
   - Fields: quotationNumber, customer (ref), items (array), totalAmount (Decimal128), status, validUntil, convertedToOrder (ref), approvalTracking, createdAt, updatedAt

4. **orders** - Confirmed orders
   - Fields: customer (ref), items (array), totalAmount (Decimal128), status, deliveryAddress, approvalTracking, createdAt, updatedAt

---

## 🔑 Key Concepts

### Unit Conversion System

- **Three Dimensions Supported:**
  - Weight: `g` (base) ↔ `kg` (1 kg = 1000 g)
  - Volume: `mL` (base) ↔ `L` (1 L = 1000 mL)
  - Count: `items` (base, no conversion)

- **Storage Strategy:** Everything stored in base units (g, mL, items) in MongoDB
- **Display Strategy:** Converted to user-selected unit on frontend
- **Precision:** Decimal.js used on both backend and frontend to prevent floating-point errors

### Authentication Flow

1. User registers with email/password/role
2. Password hashed with bcryptjs
3. On login, JWT token generated and stored in localStorage
4. Token sent in Authorization header for all protected requests
5. Middleware verifies token and extracts userId & userRole

### Quotation to Order Flow

1. Seller creates quotation with products & quantities
2. Admin reviews quotation
3. Admin approves → quotation status changes to "approved"
4. Admin converts approved quotation to order
5. Order created with same items, status="pending"
6. Order can be confirmed, shipped, delivered

---

## 📝 Environment Variables

### Backend (`.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=koushikJWT
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env`)

```
REACT_APP_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Start MongoDB

```bash
mongod
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

Creates:
- Admin: `admin@inventory.com` / `admin123`
- Sellers: `seller@inventory.com` / `seller123`, `seller2@inventory.com` / `seller123`
- 10 sample products

### 4. Start Backend

```bash
cd backend
npm start
# Runs on http://localhost:5000
```

### 5. Start Frontend

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Auth Pages   │ Product      │ Quotation    │ Admin      │
│  │ (Login/Reg)  │ Browser      │ Flow         │ Panel      │
│  └──────────────┴──────────────┴──────────────┴────────────┘
│         ↕ (Fetch with JWT Token)
├─────────────────────────────────────────────────────────────┤
│         API GATEWAY (Express.js with Middleware)            │
│   Auth Middleware (JWT Verification & Role Check)          │
├─────────────────────────────────────────────────────────────┤
│                    CONTROLLERS (Logic)                       │
│  Auth → Product → Quotation → Order → User                 │
├─────────────────────────────────────────────────────────────┤
│                    DATA MODELS (Mongoose)                    │
│  User → Product → Quotation → Order                         │
├─────────────────────────────────────────────────────────────┤
│               DATABASE (MongoDB Collections)                 │
│  users → products → quotations → orders                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Unit Conversion Example

**Scenario:** Product stored as 5 kg at ₹500/kg

```
Storage (Base Units): quantity=5000g, unit=g, basePrice=500
↓
Frontend Display: User sees "5 kg" 
↓
User wants to buy 2500g:
- Convert to base: 2500g (already in base)
- Calculate price: (2500 ÷ 1000) × 500 = ₹1250
- Display: "2500g @ ₹1250"
↓
Quotation saved with: quantity=2500, unit=g, pricePerUnit=0.5 (₹/g), totalPrice=1250
```

---

## 📋 Complete File Count

- **Backend:** 15 files (5 routes, 5 controllers, 4 models, 1 middleware, 1 config, 1 utils, 2 config files)
- **Frontend:** 10 files (4 pages, 1 component, 1 context, 3 utilities, 1 HTML)
- **Database Seed:** 1 script
- **Total Code Files:** 26 + 5 config files + 1 documentation

---

## ✅ Project Checklist

- ✅ Backend API (5 controllers, 20+ endpoints)
- ✅ Frontend UI (4 pages, full authentication)
- ✅ Unit Conversion System (Decimal.js precision)
- ✅ Database Models (MongoDB, Mongoose)
- ✅ Authentication (JWT + bcrypt)
- ✅ Seed Data (Test users + products)
- ✅ Role-Based Access (Admin vs Seller)
- ✅ Quotation Flow (Create → Approve → Convert to Order)
- ✅ Error Handling
- ✅ Environment Configuration

---

Generated: June 3, 2026
