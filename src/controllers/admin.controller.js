import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {User} from '../models/user.model.js';
import {Order} from '../models/order.model.js';
import {Product} from '../models/product.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Ban request for user ID:", id); 

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json({ message: "User banned successfully", user });

  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Unban request received for user ID:", id);

    const user = await User.findById(id);
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User data before unbanning:", user);

    if (!user.isBanned) {
      console.log("User is already unbanned.");
      return res.status(400).json({ message: "User is not banned" });
    }

    user.isBanned = false;
    await user.save();

    console.log("User successfully unbanned:", user);
    res.status(200).json({ message: "User unbanned successfully", user });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
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

    
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      return res.status(500).json({ message: "Image upload failed" });
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

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};
