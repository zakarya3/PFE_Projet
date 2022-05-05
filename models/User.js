const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  doctor_id: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  specialite: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  Role: {
    type: String,
    required: true,
  },
  Accepte: {
    type: Boolean,
    default: false,
  }
});

const User = mongoose.model("user", UserSchema);

module.exports = User;