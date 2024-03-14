const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  });
  
  const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderDetails: [orderDetailSchema],
    orderDate: { type: Date, default: Date.now },
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;
  