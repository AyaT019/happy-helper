import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "happyhelper_secret_key_2026";

router.post("/register", async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || typeof phone !== "string" || !password) {
      return res.status(400).json({ error: "Name, phone, and password are required" });
    }
    
    // Quick validation, standard users must have a real phone number
    if (phone.trim() === "") {
      return res.status(400).json({ error: "Please provide a valid phone number" });
    }
    
    // Check if phone already registered
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ error: "Phone number already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone: phone.trim(),
      password: hashedPassword,
      role: "user"
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "30d" });
    
    res.status(201).json({ user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (typeof phone !== "string" || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, token });
  } catch (err) {
    next(err);
  }
});
