import express from "express";
import { Order } from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import nodemailer from "nodemailer";

export const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "test@gmail.com",
    pass: process.env.EMAIL_PASS || "nopassword"
  }
});

// Get all orders (admin)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Create order (public)
router.post("/", async (req, res, next) => {
  try {
    const { name, phone, notes, items, total } = req.body;
    if (!name || !phone || !Array.isArray(items) || typeof total !== "number") {
      return res.status(400).json({ error: "Invalid order payload" });
    }
    const order = await Order.create({
      name,
      phone,
      notes: notes || "",
      items,
      total,
      status: "pending",
      date: new Date().toLocaleDateString("en-GB"),
    });

    // Send email notification non-blocking
    if (process.env.EMAIL_USER) {
      const emailText = `New Order from ${name}!\n\nPhone: ${phone}\nTotal: ${total} TND\nNotes: ${notes}\n\nItems:\n${items.map(i => `- ${i.qty}x ${i.name}`).join("\n")}`;
      transporter.sendMail({
        from: `"Store Notifications" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // sends to the admin's email
        subject: `New Order! ${total} TND - ${name}`,
        text: emailText,
      }).catch(e => console.error("Email notification failed: ", e));
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// Mark order done (admin)
router.patch("/:id/done", requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Delete order (admin)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await Order.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Order not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
