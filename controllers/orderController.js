import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Utility Function (unchanged)
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = (itemsPrice * taxRate).toFixed(2);

  const totalPrice = (
    itemsPrice +
    shippingPrice +
    parseFloat(taxPrice)
  ).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
  };
}

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    const error = new Error("No order items");
    error.statusCode = 400;
    throw error;
  }

  // ✅ Validate orderItems is a real array — prevents injection via malformed body
  if (!Array.isArray(orderItems)) {
    const error = new Error("Invalid order items");
    error.statusCode = 400;
    throw error;
  }

  // ✅ Cast each item's _id to string — prevents operator injection inside array
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => String(x._id)) },
  });

  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = itemsFromDB.find(
      (itemFromDB) => itemFromDB._id.toString() === String(itemFromClient._id)
    );

    if (!matchingItemFromDB) {
      const error = new Error(`Product not found: ${itemFromClient._id}`);
      error.statusCode = 404;
      throw error;
    }

    return {
      ...itemFromClient,
      product: String(itemFromClient._id), // ✅ force string
      price: matchingItemFromDB.price,      // ✅ price always taken from DB — never trusted from client
      _id: undefined,
    };
  });

  // ✅ Sanitize shippingAddress fields — cast each to string
  const sanitizedShippingAddress = {
    address: String(shippingAddress.address || ""),
    city: String(shippingAddress.city || ""),
    postalCode: String(shippingAddress.postalCode || ""),
    country: String(shippingAddress.country || ""),
  };

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
    calcPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress: sanitizedShippingAddress, // ✅ sanitized version
    paymentMethod: String(paymentMethod),       // ✅ force string
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

const getAllOrders = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const orders = await Order.find({}).populate("user", "id username");
  res.json(orders);
});

const getUserOrders = asyncHandler(async (req, res) => {
  // ✅ req.user._id comes from verified JWT — safe as is
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const countTotalOrders = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const totalOrders = await Order.countDocuments();
  res.json({ totalOrders });
});

const calculateTotalSales = asyncHandler(async (req, res) => {
  // ✅ No user input used — safe as is
  const orders = await Order.find();
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  res.json({ totalSales });
});

const calcualteTotalSalesByDate = asyncHandler(async (req, res) => {
  // ✅ No user input used — aggregation pipeline is safe as is
  const salesByDate = await Order.aggregate([
    {
      $match: {
        isPaid: true,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
        },
        totalSales: { $sum: { $toDouble: "$totalPrice" } },
      },
    },
  ]);

  res.json(salesByDate);
});

const findOrderById = asyncHandler(async (req, res) => {
  // ✅ findById is safe — Mongoose validates ObjectId internally
  const order = await Order.findById(req.params.id).populate(
    "user",
    "username email"
  );

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  res.json(order);
});

const markOrderAsPaid = asyncHandler(async (req, res) => {
  // ✅ findById is safe — Mongoose validates ObjectId internally
  const order = await Order.findById(req.params.id);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  // ✅ Cast each paymentResult field to string — prevents operator injection
  order.paymentResult = {
    id: String(req.body.id || ""),
    status: String(req.body.status || ""),
    update_time: String(req.body.update_time || ""),
    email_address: String(req.body.payer?.email_address || ""),
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const markOrderAsDelivered = asyncHandler(async (req, res) => {
  // ✅ findById is safe — Mongoose validates ObjectId internally
  const order = await Order.findById(req.params.id);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
};