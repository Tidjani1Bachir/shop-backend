import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  // ✅ Cast to string — prevents operator injection via name field
  const name = String(req.body.name || "").trim();

  if (!name) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  // ✅ Use sanitized name in query — not raw req.body.name
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    const error = new Error("Category already exists");
    error.statusCode = 409;
    throw error;
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  // ✅ Cast to string — prevents operator injection via name field
  const name = String(req.body.name || "").trim();
  const { categoryId } = req.params;

  if (!name) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  // ✅ findById is safe — Mongoose validates ObjectId internally
  const category = await Category.findById(categoryId);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  // ✅ Use sanitized name — not raw req.body.name
  category.name = name;
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

const removeCategory = asyncHandler(async (req, res) => {
  // ✅ findByIdAndDelete is safe — Mongoose validates ObjectId internally
  const removed = await Category.findByIdAndDelete(req.params.categoryId);
  if (!removed) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: "Category deleted", removed });
});

const listCategory = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const all = await Category.find({});
  res.json(all);
});

const readCategory = asyncHandler(async (req, res) => {
  // ✅ findById is safe — Mongoose validates ObjectId internally
  const category = await Category.findById(req.params.id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(category);
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};