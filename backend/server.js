import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { router as stickersRouter } from "./src/routes/stickers.js";
import { router as ordersRouter } from "./src/routes/orders.js";
import { router as categoriesRouter } from "./src/routes/categories.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/happy_helper";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/stickers", stickersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

