// utils/calculateCoupon.js

const coupons = {
  SAVE200: { type: "fixed", value: 200 },
  OFF10: { type: "percentage", value: 10 },
  FLAT50: { type: "fixed", value: 50 },
};

const calculateCoupon = (subtotal, couponCode) => {
  let discount = 0;
  let discountType = null;
  let discountValue = 0;

  if (!couponCode) {
    return {
      success: true,
      discount,
      discountType,
      discountValue,
    };
  }

  const coupon = coupons[couponCode.toUpperCase()];

  if (!coupon) {
    return {
      success: false,
      message: "Invalid coupon code",
    };
  }

  discountType = coupon.type;
  discountValue = coupon.value;

  if (coupon.type === "fixed") {
    discount = coupon.value;
  } else {
    discount = (subtotal * coupon.value) / 100;
  }

  return {
    success: true,
    discount,
    discountType,
    discountValue,
  };
};

module.exports = calculateCoupon;