import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

// Helper: Validate required fields
const validateProductFields = (fields) => {
  const { name, description, price, category, quantity, brand } = fields;
  if (!name) throw createError("Name is required", 400);
  if (!brand) throw createError("Brand is required", 400);
  if (!description) throw createError("Description is required", 400);
  if (!price) throw createError("Price is required", 400);
  if (!category) throw createError("Category is required", 400);
  if (!quantity) throw createError("Quantity is required", 400);
};

// For UPDATE — only validate provided fields
const validateProductForUpdate = (fields) => {
  const { name, description, price, category, quantity, brand } = fields;
  if (name !== undefined && !name.trim()) throw createError("Name cannot be empty", 400);
  if (brand !== undefined && !brand.trim()) throw createError("Brand cannot be empty", 400);
  if (description !== undefined && !description.trim()) throw createError("Description cannot be empty", 400);
  if (price !== undefined && (isNaN(price) || Number(price) <= 0)) {
    throw createError("Price must be a positive number", 400);
  }
  if (category !== undefined && !category) throw createError("Category is required", 400);
  if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 0)) {
    throw createError("Quantity must be a non-negative number", 400);
  }
};

// Helper: Create error with status code
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const addProduct = asyncHandler(async (req, res) => {
  validateProductFields(req.fields);

  // ✅ Explicitly cast each field to its correct type — prevents NoSQL injection
  const { name, description, price, category, quantity, brand } = req.fields;
  const product = new Product({
    name: String(name),
    description: String(description),
    price: Number(price),
    category: String(category),
    quantity: Number(quantity),
    brand: String(brand),
  });

  await product.save();
  res.status(201).json(product);
});

const updateProductDetails = asyncHandler(async (req, res) => {
  validateProductForUpdate(req.fields);

  // ✅ Only include fields that were actually sent — preserves partial update logic
  const { name, description, price, category, quantity, brand } = req.fields;
  const updateData = {};
  if (name !== undefined)        updateData.name = String(name);
  if (description !== undefined) updateData.description = String(description);
  if (price !== undefined)       updateData.price = Number(price);
  if (category !== undefined)    updateData.category = String(category);
  if (quantity !== undefined)    updateData.quantity = Number(quantity);
  if (brand !== undefined)       updateData.brand = String(brand);

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw createError("Product not found", 404);
  }

  res.json(product);
});

const removeProduct = asyncHandler(async (req, res) => {
  // ✅ findByIdAndDelete is safe — Mongoose validates ObjectId internally
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw createError("Product not found", 404);
  }
  res.json({ message: "Product deleted", product });
});

const fetchProducts = asyncHandler(async (req, res) => {
  const pageSize = 6;

  // ✅ Force keyword to string — prevents operator injection via query string
  const keyword = req.query.keyword
    ? { name: { $regex: String(req.query.keyword), $options: "i" } }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword }).limit(pageSize);

  res.json({
    products,
    page: 1,
    pages: Math.ceil(count / pageSize),
    hasMore: false,
  });
});

const fetchProductById = asyncHandler(async (req, res) => {
  // ✅ findById is safe — Mongoose validates ObjectId internally
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw createError("Product not found", 404);
  }
  res.json(product);
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const products = await Product.find({})
    .populate("category")
    .limit(12)
    .sort({ createdAt: -1 });

  res.json(products);
});

const addProductReview = asyncHandler(async (req, res) => {
  // ✅ Explicitly cast rating to Number and comment to String — prevents injection
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment);

  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw createError("Rating must be a number between 1 and 5", 400);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw createError("Product not found", 404);
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw createError("Product already reviewed", 400);
  }

  const review = {
    name: req.user.username,
    rating,
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.json(products);
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const products = await Product.find().sort({ _id: -1 }).limit(5);
  res.json(products);
});

const filterProducts = asyncHandler(async (req, res) => {
  // ✅ Validate arrays and cast each item to correct type — prevents operator injection
  const checked = Array.isArray(req.body.checked)
    ? req.body.checked.map((id) => String(id))
    : [];

  const radio = Array.isArray(req.body.radio)
    ? req.body.radio.map((val) => Number(val))
    : [];

  let args = {};
  if (checked.length > 0) args.category = { $in: checked };
  if (radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };

  const products = await Product.find(args);
  res.json(products);
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};