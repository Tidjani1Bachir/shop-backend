# 🛒 ShopSphere — Backend REST API

> A production-grade, security-first REST API built with **Node.js + Express + MongoDB**, powering a full e-commerce platform with JWT authentication, multi-layer file upload security, and PayPal payment integration.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![Postman](https://img.shields.io/badge/API_Tested-Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](./postman_collection.json)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Security Implementation](#-security-implementation)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Testing](#-api-testing)
- [Key Engineering Decisions](#-key-engineering-decisions)
- [Frontend Repo](#-frontend-repo)

---

## 🌟 Overview

This is the backend service for ShopSphere — a complete e-commerce platform. It exposes a RESTful API consumed by the React frontend, handling authentication, product management, order processing, PayPal payment verification, and file uploads with multi-layer security validation.

**Live API:** `https://shopsphere-backend.onrender.com`
**Frontend Repo:** `https://github.com/yourusername/shopsphere-frontend`

---

## 🔐 Security Implementation

Security was treated as a first-class concern throughout the entire API:

### Authentication & Session
- **JWT stored in `HttpOnly` cookies** — Completely inaccessible to JavaScript, eliminating XSS token theft vectors
- **`SameSite: "strict"`** — Prevents CSRF attacks by blocking cross-origin cookie attachment
- **Bcrypt password hashing** — Industry-standard salted hashing for all stored passwords

### File Upload Security (Multi-Layer)
```
Layer 1: File Extension Validation   → /jpe?g|png|webp/
Layer 2: MIME Type Validation        → /image\/jpe?g|image\/png|image\/webp/
Layer 3: Path Traversal Prevention   → sanitize-filename package
Layer 4: Virus Scanning              → ClamAV (clamdjs) stream scanning
```
> A `.exe` renamed to `.jpg` passes the extension check but fails the MIME check. Both layers are required.

### Attack Surface Reduction
| Attack | Mitigation |
|---|---|
| XSS | `HttpOnly` cookies, input sanitization |
| CSRF | `SameSite: "strict"` cookie policy |
| Path Traversal | `sanitize-filename` + `path.basename()` |
| Malware Upload | ClamAV stream scanner on every upload |
| Credential Exposure | PayPal Client ID served via endpoint, never hardcoded |

---

## 📊 Data Models

### `User`
```
username, email, password (hashed), isAdmin, favorites[], createdAt, updatedAt
Methods: comparePassword(), addToFavorites(), removeFromFavorites(),
         getFavoriteProducts(), getTotalCustomers(), updateProfile(), changePassword()
```

### `Product`
```
name, categoryId (FK), image, brand, quantity, description,
rating, numReviews, price, countInStock, createdAt, updatedAt
Methods: addReview(), updateStock(), getAverageRating()
```

### `Order`
```
userId (FK), paymentMethod, itemsPrice, taxPrice, shippingPrice,
totalPrice, isPaid, paidAt, isDelivered, deliveredAt
Methods: calculatePrices(), markAsPaid(), markAsDelivered()
```

### Supporting Models
- **`OrderItem`** — orderId (FK), productId (FK), name, qty, image, price
- **`ShippingAddress`** — orderId (FK), address, city, postalCode, country
- **`PaymentResult`** — orderId (FK), paypalId, status, updateTime, emailAddress
- **`Review`** — productId (FK), userId (FK), name, rating, comment
- **`Category`** — name; full CRUD with `create()`, `findById()`, `update()`, `delete()`

---

## 📡 API Endpoints

### Auth & Users
```
POST   /api/users/auth          → Login (sets HttpOnly JWT cookie)
POST   /api/users/register      → Register new user
POST   /api/users/logout        → Clear JWT cookie
GET    /api/users/profile       → Get profile (protected)
PUT    /api/users/profile       → Update profile (protected)
POST   /api/users/favorites     → Sync favorites (protected)
GET    /api/users               → Get all users (admin)
DELETE /api/users/:id           → Delete user (admin)
```

### Products
```
GET    /api/products            → Get all products (filterable by category/brand/price)
GET    /api/products/:id        → Get single product
POST   /api/products            → Create product (admin)
PUT    /api/products/:id        → Update product (admin)
DELETE /api/products/:id        → Delete product (admin)
POST   /api/products/:id/reviews → Add review (protected)
```

### Categories
```
GET    /api/categories/categories → Get all categories
POST   /api/categories            → Create category (admin)
PUT    /api/categories/:id        → Update category (admin)
DELETE /api/categories/:id        → Delete category (admin)
```

### Orders
```
POST   /api/orders              → Create order (protected)
GET    /api/orders/mine         → Get user's orders (protected)
GET    /api/orders/:id          → Get order by ID (protected)
PUT    /api/orders/:id/pay      → Mark as paid (protected)
PUT    /api/orders/:id/deliver  → Mark as delivered (admin)
GET    /api/orders              → Get all orders (admin)
```

### Other
```
GET    /api/config/paypal       → Get PayPal Client ID (public)
POST   /api/upload              → Upload product image (admin, multi-layer validated)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- PayPal Developer account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shopsphere-backend.git
cd shopsphere-backend

# Install dependencies
npm install

# Create your .env file
cp example.env .env
# Fill in your values in .env

# Run in development
npm run dev

# Run in production
npm start
```

---

## 🔑 Environment Variables

Copy `example.env` to `.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
PAYPAL_CLIENT_ID=your_paypal_client_id
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 🧪 API Testing

All endpoints were tested using **Postman**, covering happy paths and edge cases.

Import the collection:
> Open Postman → Click **Import** → Select `postman_collection.json`

### Test Coverage

| Category | Tested Scenarios |
|---|---|
| **Auth** | Register, login correct/wrong credentials (401), logout |
| **Protected Routes** | Access without token (401), with valid token (200) |
| **Admin Routes** | Regular user blocked (403), admin access granted |
| **File Upload** | Valid image accepted, `.exe` rejected, wrong MIME type rejected |
| **Orders** | Create order (authenticated), blocked when unauthenticated |
| **Categories** | Full CRUD cycle |
| **Products** | Filter by category/brand/price, add review |
| **PayPal** | Config endpoint returns Client ID correctly |

---

## 📁 Project Structure

```
shopsphere-backend/
├── config/             # Database connection
├── controllers/        # Route handler logic
├── middlewares/        # Auth, error handling, upload validation
├── models/             # Mongoose schemas
├── routes/             # Express routers
├── utils/              # Helper functions
├── index.js            # Entry point
├── package.json
└── example.env
```

---

## 💡 Key Engineering Decisions

### HttpOnly Cookie vs. localStorage for JWT
Storing JWTs in `localStorage` is a common anti-pattern — any JavaScript on the page can read it, making it trivially vulnerable to XSS. By using an `HttpOnly` cookie, the browser handles token transmission automatically, and no script can ever access the token.

### MongoDB for Backward-Compatible Migration
MongoDB's flexible schema allowed new fields (like `favorites`) to be added to the User model without migration scripts, without breaking existing documents, and without downtime.

### Four-Layer File Upload Validation
Each layer catches a different attack vector. Extensions are trivially fakeable. MIME types are harder to spoof. `sanitize-filename` prevents directory traversal. ClamAV catches known malware that passes all other checks. Defense in depth — no single check is sufficient.

---

## 🔗 Frontend Repo

The React frontend that consumes this API:
👉 [shopsphere-frontend](https://github.com/yourusername/shopsphere-frontend)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ using Node.js + Express + MongoDB
  <br/>
  <sub>Security-first. Production-ready. Recruiter-approved.</sub>
</div>