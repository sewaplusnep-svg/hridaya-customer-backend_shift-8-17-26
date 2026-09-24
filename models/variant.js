const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    variant_id: String,
    product_id: String,
    variant_name: String,
    long_description: String,
    price: Number,
    images: [String],
    size: String,
    color: String,
    fragrance: String,
    shape: String,
    weight: Number,
    burn_time: Number,
    stock: Number,
    sku: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variant", variantSchema);