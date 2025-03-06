import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {User} from '../models/user.model.js';
import {Order} from '../models/order.model.js';
import {Product} from '../models/product.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not an admin' });
    }

    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET , { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const getAdminDashboard = (req, res) => {
  res.json({ });
};


export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};



export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId').populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};



export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    if (!title || !description || !price || !category || !stock || !req.file) {
      return res.status(400).json({ message: "All fields and an image are required" });
    }

    // ✅ Upload Image to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // ✅ Remove file from local storage after upload
    fs.unlinkSync(req.file.path);

    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      thumbnail: cloudinaryResponse.secure_url, // ✅ Store Cloudinary image URL
    });

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};
