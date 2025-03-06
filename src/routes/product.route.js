import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect, verifyAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', protect, verifyAdmin, upload.single("image"), createProduct);
router.put('/:id', protect, verifyAdmin, upload.single("image"), updateProduct);
router.delete('/:id', protect, verifyAdmin, deleteProduct);

export default router;
