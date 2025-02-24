import mongoose, {Schema} from "mongoose";
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  thumbnail: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, required: true }
},{
    timestamps:true
});

export const Product = mongoose.model("Product", ProductSchema);
