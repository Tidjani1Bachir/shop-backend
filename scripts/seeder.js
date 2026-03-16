// scripts/seeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
// ============================================================
// USERS
// ============================================================
const users = [
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
];

// ============================================================
// CATEGORIES
// ============================================================
const categories = [
  "Smartphones",
  "Laptops",
  "Cameras",
  "Audio",
  "Accessories",
];

// ============================================================
// PRODUCTS
// ============================================================
const products = [
  // --- Smartphones ---
  {
    name: "ProMax Smartphone X12",
    brand: "TechVision",
    description:
      "Latest flagship smartphone with 6.7-inch AMOLED display, 108MP triple camera system, and 5000mAh battery with 65W fast charging.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format",
    price: 899.99,
    countInStock: 45,
    rating: 4.5,
    numReviews: 128,
    category: "Smartphones",
  },
  {
    name: "Galaxy Lite S20",
    brand: "StarMobile",
    description:
      "Mid-range smartphone with 6.4-inch Super AMOLED, 64MP camera, 4500mAh battery and 5G support.",
    image:
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format",
    price: 499.99,
    countInStock: 70,
    rating: 4.2,
    numReviews: 95,
    category: "Smartphones",
  },
  {
    name: "ZenPhone Ultra",
    brand: "ZenTech",
    description:
      "Premium smartphone with titanium frame, 200MP periscope camera and Snapdragon 8 Gen 3 processor.",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format",
    price: 1199.99,
    countInStock: 30,
    rating: 4.8,
    numReviews: 64,
    category: "Smartphones",
  },

  // --- Laptops ---
  {
    name: "UltraBook Pro 15",
    brand: "SwiftTech",
    description:
      "Thin and light laptop with Intel i7 13th Gen, 16GB RAM, 512GB NVMe SSD and 10-hour battery life.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format",
    price: 1299.99,
    countInStock: 20,
    rating: 4.7,
    numReviews: 87,
    category: "Laptops",
  },
  {
    name: "GameBook X17",
    brand: "SwiftTech",
    description:
      "Gaming laptop with RTX 4070, Intel i9, 32GB DDR5 RAM, 1TB SSD and 17.3-inch 165Hz display.",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format",
    price: 1999.99,
    countInStock: 15,
    rating: 4.6,
    numReviews: 52,
    category: "Laptops",
  },
  {
    name: "SlimBook Air 13",
    brand: "AirTech",
    description:
      "Ultra-portable 13-inch laptop weighing just 1.1kg with M2 chip, 8GB RAM and all-day battery.",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format",
    price: 999.99,
    countInStock: 35,
    rating: 4.5,
    numReviews: 110,
    category: "Laptops",
  },

  // --- Cameras ---
  {
    name: "4K Mirrorless Camera",
    brand: "OptiShot",
    description:
      "24MP full-frame mirrorless camera with 4K60fps video, in-body 5-axis stabilization and weather sealing.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format",
    price: 1799.99,
    countInStock: 15,
    rating: 4.8,
    numReviews: 74,
    category: "Cameras",
  },
  {
    name: "Action Camera 4K Pro",
    brand: "OptiShot",
    description:
      "Waterproof action camera with 4K/60fps, HyperSmooth stabilization, wide-angle lens and voice control.",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format",
    price: 249.99,
    countInStock: 40,
    rating: 4.5,
    numReviews: 103,
    category: "Cameras",
  },
  {
    name: "Instant Print Camera",
    brand: "SnapShot",
    description:
      "Retro-style instant camera with built-in flash, selfie mirror and 10 shots per charge.",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=500&auto=format",
    price: 89.99,
    countInStock: 60,
    rating: 4.1,
    numReviews: 145,
    category: "Cameras",
  },

  // --- Audio ---
  {
    name: "Wireless Noise-Cancelling Headphones",
    brand: "SoundWave",
    description:
      "Premium over-ear headphones with 40dB active noise cancellation, 30-hour battery and Hi-Res Audio.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format",
    price: 299.99,
    countInStock: 60,
    rating: 4.6,
    numReviews: 210,
    category: "Audio",
  },
  {
    name: "Portable Bluetooth Speaker",
    brand: "SoundWave",
    description:
      "IP67 waterproof portable speaker with 360° sound, 20-hour battery, built-in mic and party mode.",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format",
    price: 79.99,
    countInStock: 120,
    rating: 4.3,
    numReviews: 190,
    category: "Audio",
  },
  {
    name: "True Wireless Earbuds Pro",
    brand: "SoundWave",
    description:
      "Premium TWS earbuds with ANC, transparency mode, 8-hour playtime, wireless charging case.",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format",
    price: 149.99,
    countInStock: 90,
    rating: 4.4,
    numReviews: 267,
    category: "Audio",
  },

  // --- Accessories ---
  {
    name: "Smart Watch Series 5",
    brand: "WristTech",
    description:
      "Health-focused smartwatch with ECG, SpO2 sensor, built-in GPS, sleep tracking and 7-day battery.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format",
    price: 349.99,
    countInStock: 80,
    rating: 4.4,
    numReviews: 156,
    category: "Accessories",
  },
  {
    name: "USB-C Hub 7-in-1",
    brand: "ConnectPro",
    description:
      "Multiport hub with 4K HDMI, 3x USB-A 3.0, SD/microSD card reader and 100W Power Delivery.",
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format",
    price: 49.99,
    countInStock: 200,
    rating: 4.2,
    numReviews: 312,
    category: "Accessories",
  },
  {
    name: "Wireless Charging Pad 15W",
    brand: "ChargeX",
    description:
      "15W fast wireless Qi charger with LED indicator, foreign object detection and non-slip surface.",
    image:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format",
    price: 29.99,
    countInStock: 300,
    rating: 4.1,
    numReviews: 445,
    category: "Accessories",
  },
  {
    name: "Gaming Mechanical Keyboard",
    brand: "KeyForce",
    description:
      "TKL RGB mechanical keyboard with Cherry MX Red switches, per-key lighting and anti-ghosting.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format",
    price: 129.99,
    countInStock: 100,
    rating: 4.5,
    numReviews: 88,
    category: "Accessories",
  },
  {
    name: "Laptop Backpack 17\"",
    brand: "CarryPro",
    description:
      "Anti-theft backpack with hidden zipper, USB charging port, TSA-friendly and fits up to 17-inch laptops.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format",
    price: 59.99,
    countInStock: 150,
    rating: 4.4,
    numReviews: 278,
    category: "Accessories",
  },
  {
    name: "Ultrawide Gaming Monitor 34\"",
    brand: "ViewMax",
    description:
      "34-inch curved ultrawide QHD monitor, 144Hz refresh rate, 1ms response time and HDR400.",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format",
    price: 649.99,
    countInStock: 25,
    rating: 4.7,
    numReviews: 67,
    category: "Accessories",
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================
const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📂 Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared old data");

    // Seed users
    await User.insertMany(users);
    console.log("👤 Users seeded:");
    console.log("   Admin  → admin@demo.com  / admin123");
    console.log("   User   → user@demo.com   / user123");

    // Seed categories and build lookup table
    const categoryLookup = {};
    for (const name of categories) {
      const created = await Category.create({ name });
      categoryLookup[name] = created._id;
    }
    console.log(`🏷️  ${categories.length} categories seeded`);

    // Seed products with correct category IDs
    const productsToInsert = products.map((p) => ({
      name: p.name,
      brand: p.brand,
      description: p.description,
      image: p.image,
      category: categoryLookup[p.category],
      price: p.price,
      countInStock: p.countInStock,
      quantity: p.countInStock,
      rating: p.rating,
      numReviews: p.numReviews,
    }));

    await Product.insertMany(productsToInsert);
    console.log(`📦 ${products.length} products seeded`);

    console.log("");
    console.log("🎉 Database is ready for demo!");
    console.log("=====================================");
    console.log("  Admin  → admin@demo.com / admin123");
    console.log("  User   → user@demo.com  / user123");
    console.log("=====================================");

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();