import express from "express";
import { protect, verifyAdmin } from "../middlewares/auth.middleware.js";
import { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/", protect, getUserOrders);
router.delete("/:id", protect, cancelOrder);

router.get("/all", protect, verifyAdmin, getAllOrders);
router.put("/:id", protect, verifyAdmin, updateOrderStatus);

export default router;
