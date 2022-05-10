const mongoose = require("mongoose");
const RdvSchema = new mongoose.Schema({
  idpatient: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  medecin: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: false,
  },
  
},
{
  timestamps: true,
});

const Rdv = mongoose.model("rdv", RdvSchema);

module.exports = Rdv;