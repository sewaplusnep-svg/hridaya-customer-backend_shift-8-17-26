const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: String,
  name: String,
  type: String,
  short_description: String,
  price: Number,
  image: String,
});

module.exports = mongoose.model("Product", productSchema);