const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // register fields
    full_name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // profile fields
    phone: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    profilePic: {
      type: String,
      default: ""
    },

    // OTP system
    otp: {
      type: String,
      default: null
    },

    otpExpires: {
      type: Date,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);