"use strict";

// Middleware Imports

const mongoose = require("mongoose");

// Schema Structure

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  name: { type: String, required: true, unique: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true, default: 0 },
  dislikes: { type: Number, required: true, default: 0 },
  usersLiked: [{ type: String, required: false, default: [] }],
  usersDisliked: [{ type: String, required: false, default: [] }],
});

// Export

module.exports = mongoose.model("Sauce", sauceSchema);
