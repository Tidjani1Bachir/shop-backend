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
//"If the client sent a name field, but it’s empty or just whitespace, reject the request."
//But if they didn’t send name at all, we skip this check entirely — which is perfect for partial updates!
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

  const product = new Product({ ...req.fields });
  await product.save();
  res.status(201).json(product);
});

const updateProductDetails = asyncHandler(async (req, res) => {
  validateProductForUpdate(req.fields);

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.fields },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw createError("Product not found", 404);
  }

  res.json(product);
});

const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw createError("Product not found", 404);
  }
  res.json({ message: "Product deleted", product });
});

const fetchProducts = asyncHandler(async (req, res) => {
  const pageSize = 6;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
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
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw createError("Product not found", 404);
  }
  res.json(product);
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate("category")
    .limit(12)
    .sort({ createdAt: -1 }); // ✅ Fixed typo: "createAt" → "createdAt"

  res.json(products);
});

const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
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
    rating: Number(rating),
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
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.json(products);
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ _id: -1 }).limit(5);
  res.json(products);
});

const filterProducts = asyncHandler(async (req, res) => {
  const { checked = [], radio = [] } = req.body;

  let args = {};
  // If the user didn't select anything, args remains {} and it returns all products.
  if (checked.length > 0) args.category = { $in: checked };
  //"$in" query. It says: "Find products where the category is ID1 OR ID2."
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