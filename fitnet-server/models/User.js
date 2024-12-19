const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  sessionID: { type: String, unique: true, required: true },
  ip: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
