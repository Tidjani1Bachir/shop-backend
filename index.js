// Import the 'path' module for working with file and directory paths
import path from "path";
// Import the 'express' framework for creating the web server and handling HTTP requests
import express from "express";
// Import 'dotenv' to load environment variables from a .env file
import dotenv from "dotenv";
// Import 'cookie-parser' middleware to parse cookies from incoming HTTP requests
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

// Import database connection function
import connectDB from "./config/db.js";
// Import user routes for user-related API endpoints
import userRoutes from "./routes/userRoutes.js";
// Import category routes for product category-related API endpoints
import categoryRoutes from "./routes/categoryRoutes.js";
// Import product routes for product-related API endpoints
import productRoutes from "./routes/productRoutes.js";
// Import upload routes for file upload API endpoints
import uploadRoutes from "./routes/uploadRoutes.js";
// Import order routes for order-related API endpoints
import orderRoutes from "./routes/orderRoutes.js";

// Import models for seeding
import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";
import User from "./models/userModel.js";

// Load environment variables from .env file
dotenv.config();
// Set the server port from environment variable or use default port 5000
const port = process.env.PORT || 5000;

// Connect to the MongoDB database
connectDB();

// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());
// Middleware to parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Register user routes with the /api/users endpoint
app.use("/api/users", userRoutes);
// Register category routes with the /api/category endpoint
app.use("/api/category", categoryRoutes);
// Register product routes with the /api/products endpoint
app.use("/api/products", productRoutes);
// Register upload routes with the /api/upload endpoint
app.use("/api/upload", uploadRoutes);
// Register order routes with the /api/orders endpoint
app.use("/api/orders", orderRoutes);

// API endpoint to serve PayPal client ID for frontend integration
app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// ============================================================
// TEMPORARY SEED ROUTE — REMOVE AFTER SEEDING
// ============================================================
app.get("/api/seed", async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed users
    await User.insertMany([
      {
        username: "Admin",
        email: "admin@demo.com",
        password: bcrypt.hashSync("admin123", 10),
        isAdmin: true,
      },
      {
        username: "John Doe",
        email: "user@demo.com",
        password: bcrypt.hashSync("user123", 10),
        isAdmin: false,
      },
    ]);

    // Seed categories
    const categoryNames = ["Smartphones", "Laptops", "Cameras", "Audio", "Accessories"];
    const categoryLookup = {};
    for (const name of categoryNames) {
      const created = await Category.create({ name });
      categoryLookup[name] = created._id;
    }

    // Seed products
    const products = [
      {
        name: "ProMax Smartphone X12",
        brand: "TechVision",
        description: "Latest flagship smartphone with 6.7-inch AMOLED display, 108MP triple camera system, and 5000mAh battery with 65W fast charging.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format",
        price: 899.99, countInStock: 45, quantity: 45, rating: 4.5, numReviews: 128,
        category: categoryLookup["Smartphones"],
      },
      {
        name: "Galaxy Lite S20",
        brand: "StarMobile",
        description: "Mid-range smartphone with 6.4-inch Super AMOLED, 64MP camera, 4500mAh battery and 5G support.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format",
        price: 499.99, countInStock: 70, quantity: 70, rating: 4.2, numReviews: 95,
        category: categoryLookup["Smartphones"],
      },
      {
        name: "ZenPhone Ultra",
        brand: "ZenTech",
        description: "Premium smartphone with titanium frame, 200MP periscope camera and Snapdragon 8 Gen 3 processor.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format",
        price: 1199.99, countInStock: 30, quantity: 30, rating: 4.8, numReviews: 64,
        category: categoryLookup["Smartphones"],
      },
      {
        name: "UltraBook Pro 15",
        brand: "SwiftTech",
        description: "Thin and light laptop with Intel i7 13th Gen, 16GB RAM, 512GB NVMe SSD and 10-hour battery life.",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format",
        price: 1299.99, countInStock: 20, quantity: 20, rating: 4.7, numReviews: 87,
        category: categoryLookup["Laptops"],
      },
      {
        name: "GameBook X17",
        brand: "SwiftTech",
        description: "Gaming laptop with RTX 4070, Intel i9, 32GB DDR5 RAM, 1TB SSD and 17.3-inch 165Hz display.",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format",
        price: 1999.99, countInStock: 15, quantity: 15, rating: 4.6, numReviews: 52,
        category: categoryLookup["Laptops"],
      },
      {
        name: "SlimBook Air 13",
        brand: "AirTech",
        description: "Ultra-portable 13-inch laptop weighing just 1.1kg with M2 chip, 8GB RAM and all-day battery.",
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format",
        price: 999.99, countInStock: 35, quantity: 35, rating: 4.5, numReviews: 110,
        category: categoryLookup["Laptops"],
      },
      {
        name: "4K Mirrorless Camera",
        brand: "OptiShot",
        description: "24MP full-frame mirrorless camera with 4K60fps video, in-body 5-axis stabilization and weather sealing.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format",
        price: 1799.99, countInStock: 15, quantity: 15, rating: 4.8, numReviews: 74,
        category: categoryLookup["Cameras"],
      },
      {
        name: "Action Camera 4K Pro",
        brand: "OptiShot",
        description: "Waterproof action camera with 4K/60fps, HyperSmooth stabilization, wide-angle lens and voice control.",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format",
        price: 249.99, countInStock: 40, quantity: 40, rating: 4.5, numReviews: 103,
        category: categoryLookup["Cameras"],
      },
      {
        name: "Instant Print Camera",
        brand: "SnapShot",
        description: "Retro-style instant camera with built-in flash, selfie mirror and 10 shots per charge.",
        image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=500&auto=format",
        price: 89.99, countInStock: 60, quantity: 60, rating: 4.1, numReviews: 145,
        category: categoryLookup["Cameras"],
      },
      {
        name: "Wireless Noise-Cancelling Headphones",
        brand: "SoundWave",
        description: "Premium over-ear headphones with 40dB active noise cancellation, 30-hour battery and Hi-Res Audio.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format",
        price: 299.99, countInStock: 60, quantity: 60, rating: 4.6, numReviews: 210,
        category: categoryLookup["Audio"],
      },
      {
        name: "Portable Bluetooth Speaker",
        brand: "SoundWave",
        description: "IP67 waterproof portable speaker with 360° sound, 20-hour battery, built-in mic and party mode.",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format",
        price: 79.99, countInStock: 120, quantity: 120, rating: 4.3, numReviews: 190,
        category: categoryLookup["Audio"],
      },
      {
        name: "True Wireless Earbuds Pro",
        brand: "SoundWave",
        description: "Premium TWS earbuds with ANC, transparency mode, 8-hour playtime, wireless charging case.",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format",
        price: 149.99, countInStock: 90, quantity: 90, rating: 4.4, numReviews: 267,
        category: categoryLookup["Audio"],
      },
      {
        name: "Smart Watch Series 5",
        brand: "WristTech",
        description: "Health-focused smartwatch with ECG, SpO2 sensor, built-in GPS, sleep tracking and 7-day battery.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format",
        price: 349.99, countInStock: 80, quantity: 80, rating: 4.4, numReviews: 156,
        category: categoryLookup["Accessories"],
      },
      {
        name: "USB-C Hub 7-in-1",
        brand: "ConnectPro",
        description: "Multiport hub with 4K HDMI, 3x USB-A 3.0, SD/microSD card reader and 100W Power Delivery.",
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format",
        price: 49.99, countInStock: 200, quantity: 200, rating: 4.2, numReviews: 312,
        category: categoryLookup["Accessories"],
      },
      {
        name: "Wireless Charging Pad 15W",
        brand: "ChargeX",
        description: "15W fast wireless Qi charger with LED indicator, foreign object detection and non-slip surface.",
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format",
        price: 29.99, countInStock: 300, quantity: 300, rating: 4.1, numReviews: 445,
        category: categoryLookup["Accessories"],
      },
      {
        name: "Gaming Mechanical Keyboard",
        brand: "KeyForce",
        description: "TKL RGB mechanical keyboard with Cherry MX Red switches, per-key lighting and anti-ghosting.",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format",
        price: 129.99, countInStock: 100, quantity: 100, rating: 4.5, numReviews: 88,
        category: categoryLookup["Accessories"],
      },
      {
        name: "Laptop Backpack 17",
        brand: "CarryPro",
        description: "Anti-theft backpack with hidden zipper, USB charging port, TSA-friendly and fits up to 17-inch laptops.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format",
        price: 59.99, countInStock: 150, quantity: 150, rating: 4.4, numReviews: 278,
        category: categoryLookup["Accessories"],
      },
      {
        name: "Ultrawide Gaming Monitor 34",
        brand: "ViewMax",
        description: "34-inch curved ultrawide QHD monitor, 144Hz refresh rate, 1ms response time and HDR400.",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format",
        price: 649.99, countInStock: 25, quantity: 25, rating: 4.7, numReviews: 67,
        category: categoryLookup["Accessories"],
      },
    ];

    await Product.insertMany(products);

    res.json({
      message: "✅ Database seeded successfully!",
      data: {
        users: 2,
        categories: categoryNames.length,
        products: products.length,
      },
      credentials: {
        admin: "admin@demo.com / admin123",
        user: "user@demo.com / user123",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Seeding failed: " + err.message });
  }
});
// ============================================================
// END OF TEMPORARY SEED ROUTE — REMOVE AFTER SEEDING
// ============================================================

// Resolve the absolute path of the project root directory
const __dirname = path.resolve();
// Serve static files from the uploads directory for accessing uploaded images and media
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

/* Middleware to handle requests that don't match any defined routes (404 errors)*/
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/* Global error-handling middleware to catch and process all errors in the application*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;
  res.status(statusCode).json({
    error: message,
  });
});

// Start the Express server and listen for incoming requests on the specified port
app.listen(port, () => console.log(`Server running on port: ${port}`));