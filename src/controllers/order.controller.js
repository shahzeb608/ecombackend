import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const placeOrder = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) {
        throw new ApiError(400, "No items in order");
    }

    let totalAmount = 0;
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new ApiError(404, "Product not found");

        totalAmount += product.price * item.quantity;
    }

    const newOrder = await Order.create({
        userId: req.user._id,
        items,
        totalAmount
    });

    res.status(201).json(new ApiResponse(201, newOrder, "Order placed successfully"));
});


export const getUserOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id }).populate("items.productId");

    res.json(new ApiResponse(200, orders, "User orders fetched successfully"));
});


export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("userId").populate("items.productId");

    res.json(new ApiResponse(200, orders, "All orders fetched successfully"));
});


export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");

    if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    order.status = status;
    await order.save();

    res.json(new ApiResponse(200, order, "Order status updated successfully"));
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== "Pending") {
        throw new ApiError(400, "Order cannot be canceled");
    }

    await Order.findByIdAndDelete(id);

    res.json(new ApiResponse(200, order, "Order canceled successfully"));
});
