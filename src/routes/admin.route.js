import express from "express";
import { protect, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // ✅ Middleware for image uploads
import { adminLogin, getAdminDashboard, getUsers, getOrders, getProducts, createProduct, deleteProduct } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/dashboard", protect, verifyAdmin, getAdminDashboard);
router.get("/users", protect, verifyAdmin, getUsers);
router.get("/orders", protect, verifyAdmin, getOrders);
router.get("/products", protect, verifyAdmin, getProducts);
router.post("/products", protect, verifyAdmin, upload.single("image"), createProduct); 
router.delete("/products/:id", protect, verifyAdmin, deleteProduct);

export default router;
