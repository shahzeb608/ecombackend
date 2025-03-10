import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const token = tokenHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Authenticated User:", req.user); 
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};



export const verifyAdmin = async (req, res, next) => {
  try {
    console.log("User Data:", req.user); 

    if (!req.user || req.user.role !== 'admin') {
      console.log("Access Denied - User Role:", req.user ? req.user.role : "No User Data");
      return res.status(403).json({ message: "Access Denied - Admins Only" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Unauthorized" });
  }
};
