const mongoose = require("mongoose");
const SpecialitieSchema = new mongoose.Schema({
  specialitie: {
    type: String,
    required: true,
  },
});

const Specialitie = mongoose.model("specialitie", SpecialitieSchema);

module.exports = Specialitie;