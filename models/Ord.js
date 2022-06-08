const mongoose = require("mongoose");
const OrdSchema = new mongoose.Schema({
  patient: {
    type: String,
    required: true,
  },
  medecin: {
    type: String,
    required: true,
  },
  ft_md: {
    type: String,
    default: false,
  },
  sd_md: {
    type: String,
    default: false,
  },
  td_md: {
    type: String,
    default: false,
  },
  fd_md: {
    type: String,
    default: false,
  },
  fvd_md: {
    type: String,
    default: false,
  },
  sxt_md: {
    type: String,
    default: false,
  },
  message: {
    type: String,
    required: false,
  },
  price: {
    type: String,
    default: false,
  },
},
{
  timestamps: true,
});

const Ord = mongoose.model("ord", OrdSchema);

module.exports = Ord;