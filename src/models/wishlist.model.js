import mongoose,{Schema} from "mongoose";
const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ]
  
},{
    timestamps:true
});

export const Wishlist = mongoose.model("Wishlist", WishlistSchema);
