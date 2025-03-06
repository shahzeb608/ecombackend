import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); 
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const createProduct = asyncHandler(async (req, res) => {
    const { title, description, price, category, stock } = req.body;

    if (!title || !description || !price || !category || !stock || !req.file) {
        throw new ApiError(400, "All fields including an image are required");
    }

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Image upload failed");
    }

    fs.unlinkSync(req.file.path);

    const newProduct = await Product.create({
        title,
        description,
        price,
        category,
        stock,
        thumbnail: cloudinaryResponse.secure_url,
    });

    res.status(201).json(new ApiResponse(201, newProduct, "Product created successfully"));
});


export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, category, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    let updatedData = { title, description, price, category, stock };

    if (req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse) {
            throw new ApiError(500, "Image upload failed");
        }

        fs.unlinkSync(req.file.path);

        updatedData.thumbnail = cloudinaryResponse.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});


export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        throw new ApiError(404, "Product not found");
    }

    res.json(new ApiResponse(200, deletedProduct, "Product deleted successfully"));
});

