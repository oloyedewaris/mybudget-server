const mongoose = require("mongoose");

const { Schema } = mongoose;

// User model
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: Object,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  registeredAt: {
    type: String,
    required: true
  },
  budget: {
    type: Object,
  },
  balanceData: {
    type: Object,
  }
});

module.exports = mongoose.model("User", UserSchema);
