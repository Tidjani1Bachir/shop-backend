import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

// Helper to create errors with status codes
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw createError("Please fill all the inputs.", 400);
  }

  const userExists = await User.findOne({ email: String(req.body.email) });
  if (userExists) {
    throw createError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, password: hashedPassword });

  const savedUser = await newUser.save();
  createToken(res, savedUser._id);

  res.status(201).json({
    _id: savedUser._id,
    username: savedUser.username,
    email: savedUser.email,
    isAdmin: savedUser.isAdmin,
    
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email: String(req.body.email) });
  if (!existingUser) {
    throw createError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  createToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
    
  });
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true, // ✅ Fixed typo: "httyOnly" → "httpOnly"
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production', // optional but recommended
    sameSite: 'strict', // optional security hardening
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw createError("User not found", 404);
  }
  res.json(user);
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("User not found", 404);
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
  });
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.isAdmin) {
    throw createError("Cannot delete admin user", 400);
  }

  await User.deleteOne({ _id: user._id });
  res.json({ message: "User removed" });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw createError("User not found", 404);
  }
  res.json(user);
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw createError("User not found", 404);
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  user.isAdmin = Boolean(req.body.isAdmin);

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    // favorites: updatedUser.favorites || [],
  });
});

// we use this so if the user adds favorite products from multiple devices phone or desktopn, we can merge them without losing any
const syncFavorites = asyncHandler(async (req, res) => {
  const { favorites } = req.body; // Array of product IDs from frontend

  const user = await User.findById(req.user._id);

  if (user) {
    // Merge existing favorites with new ones and remove duplicates
    const mergedFavorites = [...new Set([...user.favorites.map(id => id.toString()), ...favorites])];
    
    user.favorites = mergedFavorites;
    await user.save();
    
    res.status(200).json({ message: "Favorites synced successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  syncFavorites,
};