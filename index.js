// Import the 'path' module for working with file and directory paths
import path from "path";
// Import the 'express' framework for creating the web server and handling HTTP requests
import express from "express";
// Import 'dotenv' to load environment variables from a .env file
import dotenv from "dotenv";
// Import 'cookie-parser' middleware to parse cookies from incoming HTTP requests
import cookieParser from "cookie-parser";
// removes MongoDB operators ($gt, $ne, etc.) from req.body, req.params, and req.query to prevent NoSQL injection attacks
import mongoSanitize from 'express-mongo-sanitize'
import cors from "cors"; 
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
 //sanitizes req.body, req.params, and req.query by removing MongoDB operators (e.g. $gt, $ne) to prevent NoSQL injection attacks
app.use(mongoSanitize())
// Middleware to parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies from incoming requests
app.use(cookieParser());
//root route because we are using React Router in the frontend, we need to serve the index.html for any route that doesn't match our API routes. This allows React Router to handle client-side routing properly.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.json({ message: 'API is running...' })
})

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
// to fix slow initial response times on platforms like Render, we add a simple health check endpoint that responds with a 200 status code. This keeps the backend "awake" and responsive for incoming requests from the frontend.
app.use("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
// API endpoint to serve PayPal client ID for frontend integration
app.get("/api/config/paypal", (req, res) => {
  // Send the PayPal client ID from environment variables to the client
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Resolve the absolute path of the project root directory
const __dirname = path.resolve();
// Serve static files from the uploads directory for accessing uploaded images and media
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

/* Middleware to handle requests that don't match any defined routes (404 errors)*/
app.use((req, res, next) => {
  // Create an error object with the unmatched route URL
  const error = new Error(`Route not found: ${req.originalUrl}`);
  // Set HTTP status code to 404 for not found
  error.statusCode = 404;
  // Pass the error to the next error-handling middleware
  next(error);
});

/* Global error-handling middleware to catch and process all errors in the application*/
app.use((err, req, res, next) => {
  // Log the error stack trace to the console for debugging purposes
  console.error(err.stack);

  // Use custom error status code if available, otherwise default to 500 (server error)
  const statusCode = err.statusCode || 500;
  // In production, send a generic message; in development, send the actual error message
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  // Send the error response to the client with appropriate status code and message
  res.status(statusCode).json({
    error: message,
  });
});

// Start the Express server and listen for incoming requests on the specified port
app.listen(port, () => console.log(`Server running on port: ${port}`));


