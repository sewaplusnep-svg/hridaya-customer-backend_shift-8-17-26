const mongoose = require("mongoose");

const candleTypeSchema = new mongoose.Schema(
  {
    typename: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model("CandleType", candleTypeSchema);