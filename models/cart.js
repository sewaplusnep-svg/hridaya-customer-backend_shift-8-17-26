const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product_variant_id: {
      type: String, // or ObjectId if variant is MongoDB
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    size: String,
    color: String,
    fragrance: String,

    image: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // replaces created_at
  }
);

module.exports = mongoose.model("Cart", cartSchema);