const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    imagePath: { type: String, required: true },
    // Các trường khác liên quan đến hình ảnh như mô tả, tên, v.v.
  });
  
  const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size' }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [imageSchema],
  });
  const Product = mongoose.model("Product", productSchema);

module.exports = Product;
