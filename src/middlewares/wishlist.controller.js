import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            userId: req.user._id,
            items: [{ productId }]
        });
    } else {
        const productExists = wishlist.items.some(item => item.productId.toString() === productId);
        if (productExists) throw new ApiError(400, "Product already in wishlist");

        wishlist.items.push({ productId });
        await wishlist.save();
    }

    res.status(201).json(new ApiResponse(201, wishlist, "Product added to wishlist"));
});


export const getUserWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate("items.productId");

    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    res.json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});


export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) throw new ApiError(404, "Wishlist not found");

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
    await wishlist.save();

    res.json(new ApiResponse(200, wishlist, "Product removed from wishlist"));
});
