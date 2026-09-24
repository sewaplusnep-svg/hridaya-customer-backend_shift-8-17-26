const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    order_no: String,

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [],

    subtotal: Number,

    discount: Number,

    discountType: String,

    discountValue: Number,

    shipping_charge: Number,

    total_amount: Number,

    coupon_code: String,

    payment_method: String,

    paymentStatus: {
      type: String,
      default: "pending",
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);