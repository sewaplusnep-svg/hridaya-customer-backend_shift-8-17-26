require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// CORS part
// =========================

app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// =========================
// Body Parser 
// ================-------=========

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =========================
// Logger
// =========================

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  console.log("ORIGIN:", req.headers.origin);
  next();
});

// =========================
// Static Upload Folder
// =========================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// Routes
// =========================

app.use("/api/auth", authRoutes);

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hridaya Customer Backend Running 🚀",
  });
});

// =========================
// MongoDB Connection
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo Error:", err.message);
  });