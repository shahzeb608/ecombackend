import express from "express";
import { protect, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 
import { 
  adminLogin, 
  getAdminDashboard, 
  getUsers, 
  getOrders, 
  getProducts, 
  createProduct, 
  deleteProduct, 
  banUser, 
  unbanUser, 
  deleteUser 
} from "../controllers/admin.controller.js";

const router = express.Router();


router.post("/login", adminLogin);


router.get("/dashboard", protect, verifyAdmin, getAdminDashboard);
router.get("/users", protect, verifyAdmin, getUsers);
router.get("/orders", protect, verifyAdmin, getOrders);
router.get("/products", protect, verifyAdmin, getProducts);


router.post("/products", protect, verifyAdmin, upload.single("image"), createProduct);
router.delete("/products/:id", protect, verifyAdmin, deleteProduct);


router.patch('/users/:id/ban', protect, verifyAdmin, banUser);
router.put("/users/:id/unban", protect, verifyAdmin, unbanUser);
router.delete("/users/:id", protect, verifyAdmin, deleteUser);

export default router;
