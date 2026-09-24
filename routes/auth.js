const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../utils/sendOtp");
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const Product = require("../models/product");
const CandleType = require("../models/candeltype");
const Variant = require("../models/variant");
const Cart = require("../models/cart");
const calculateCoupon = require("../utils/calculateCoupon");
const Order = require("../models/Order");
const Contact = require("../models/Contact");






// ================= REGISTER (WITH OTP) =================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save user with OTP
    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // 5 minutes
      isVerified: false
    });

    
    // send OTP email
    await sendOtpEmail(email, otp);
    await newUser.save();


    return res.status(201).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ================= GET USER BY ID (NEW FIX) =================
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("GET USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= UPDATE USER =================
router.put("/update-profile", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;

    const profilePic = req.file ? req.file.filename : undefined;

    const updateData = {
      full_name,
      email,
      phone,
      address,
    };

    if (profilePic) updateData.profilePic = profilePic;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated",
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Already verified"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.log("OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// product get
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// category types or candel types
router.get("/candletypes", async (req, res) => {
  try {
    const candleTypes = await CandleType.find();

    return res.status(200).json({
      success: true,
      data: candleTypes,
    });
  } catch (error) {
    console.log("GET CANDLE TYPES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// GET VARIANTS BY PRODUCT ID
router.get("/variants/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    const variants = await Variant.find({ product_id });

    return res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.log("GET VARIANTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// add t o cart
router.post("/addToCart", verifyToken, async (req, res) => {
  try {
    const {
      product_variant_id,
      name,
      size,
      color,
      fragrance,
      image,
      quantity,
      amount,
    } = req.body;

    const user_id = req.user.id;

    if (!product_variant_id || !name || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existingItem = await Cart.findOne({
      user_id,
      product_variant_id,
    });

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated",
        data: existingItem,
      });
    }

    const cartItem = new Cart({
      user_id,
      product_variant_id,
      name,
      size,
      color,
      fragrance,
      image,
      quantity: quantity || 1,
      amount,
    });

    await cartItem.save();

    return res.status(201).json({
      success: true,
      message: "Added to cart",
      data: cartItem,
    });

  } catch (error) {
    console.log("CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET CART LIST


router.get("/getCartList/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const cartItems = await Cart.find({ user_id });

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cartItems,
    });

  } catch (error) {
    console.log("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// router.post("/checkout", verifyToken, async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const {
//       cart_items = [],   // now it's array of IDs
//       coupon_code = "",
//     } = req.body;

//     if (!cart_items.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No items selected",
//       });
//     }

//     // ✅ FETCH REAL CART ITEMS FROM DB
//     const items = await Cart.find({
//       _id: { $in: cart_items },
//       user_id,
//     });

//     if (!items.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart items not found",
//       });
//     }

//     // 1. SUBTOTAL (FIXED)
//     let subtotal = items.reduce((sum, item) => {
//       return sum + Number(item.amount) * Number(item.quantity);
//     }, 0);

//     // 2. COUPONS
//     const coupons = {
//       SAVE200: { type: "fixed", value: 200 },
//       OFF10: { type: "percentage", value: 10 },
//       FLAT50: { type: "fixed", value: 50 },
//     };

//     let discount = 0;
//     let discountType = null;
//     let discountValue = 0;

//     if (coupon_code) {
//     console.log('coupon=>',coupon_code)
//       const coupon = coupons[coupon_code.toUpperCase()];
     

//       if (!coupon) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid coupon code",
//         });
//       }

//       discountType = coupon.type;
//       discountValue = coupon.value;

//       if (coupon.type === "fixed") {
//         discount = coupon.value;
//       } else {
//         discount = (subtotal * coupon.value) / 100;
//       }
//     }

//     let total = subtotal - discount;
//     if (total < 0) total = 0;

//     return res.json({
//       success: true,
//       subtotal,
//       discount,
//       discountType,
//       discountValue,
//       total,
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });




// place order 

router.post("/checkout", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      cart_items = [],
      coupon_code = "",
    } = req.body;

    if (!cart_items.length) {
      return res.status(400).json({
        success: false,
        message: "No items selected",
      });
    }

    // Get selected cart items
    const items = await Cart.find({
      _id: { $in: cart_items },
      user_id,
    });

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart items not found",
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.amount) * Number(item.quantity);
    }, 0);

    // Calculate coupon
    const couponResult = calculateCoupon(subtotal, coupon_code);

    if (!couponResult.success) {
      return res.status(400).json({
        success: false,
        message: couponResult.message,
      });
    }

    const {
      discount,
      discountType,
      discountValue,
    } = couponResult;

    // Shipping (optional)
    const shippingCharge = 100;

    // Total
    let total = subtotal - discount + shippingCharge;

    if (total < 0) total = 0;

    return res.status(200).json({
      success: true,
      subtotal,
      shippingCharge,
      discount,
      discountType,
      discountValue,
      total,
      items,
    });

  } catch (err) {
    console.error("Checkout Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
// Save Contact Message
router.post("/sendMessage", verifyToken, async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    const contact = new Contact({
      user_id: req.user.id,
      full_name,
      email,
      phone,
      subject,
      message,
    });

    await contact.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: contact,
    });
  } catch (error) {
    console.log("SAVE CONTACT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.post("/place-order", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      cart_ids = [],
      coupon_code = "",
      payment_method,
    } = req.body;

    if (!cart_ids.length) {
      return res.status(400).json({
        success: false,
        message: "No cart items selected",
      });
    }

    const carts = await Cart.find({
      _id: { $in: cart_ids },
      user_id,
    });

    if (!carts.length) {
      return res.status(400).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Calculate subtotal
    const subtotal = carts.reduce((sum, item) => {
      return sum + Number(item.amount) * Number(item.quantity);
    }, 0);

    // Calculate discount
    const couponResult = calculateCoupon(subtotal, coupon_code);

    if (!couponResult.success) {
      return res.status(400).json({
        success: false,
        message: couponResult.message,
      });
    }

    const {
      discount,
      discountType,
      discountValue,
    } = couponResult;

    const shipping_charge = 100;

    const total_amount =
      subtotal -
      discount +
      shipping_charge;

    // Create order
    const order = await Order.create({
      order_no: "ORD-" + Date.now(),

      user_id,

      items: carts,

      subtotal,

      discount,

      discountType,

      discountValue,

      shipping_charge,

      total_amount,

      coupon_code,

      payment_method,
    });

    // Remove purchased cart items
    await Cart.deleteMany({
      _id: { $in: cart_ids },
      user_id,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    console.log("PLACE ORDER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// remove single cart
router.post("/remove-cart", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { cart_ids = [] } = req.body;

    if (!cart_ids.length) {
      return res.status(400).json({
        success: false,
        message: "No cart items selected",
      });
    }

    await Cart.deleteMany({
      _id: { $in: cart_ids },
      user_id,
    });

    return res.json({
      success: true,
      message: "Cart items removed successfully",
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ================= GET ALL ORDERS =================
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.log("GET ORDERS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = router;