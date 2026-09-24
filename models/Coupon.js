const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },

  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },

  value: {
    type: Number,
    required: true,
  },

  minOrderAmount: {
    type: Number,
    default: 0,
  },

  expiryDate: {
    type: Date,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Coupon", CouponSchema);