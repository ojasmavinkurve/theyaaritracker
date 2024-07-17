const mongoose= require("mongoose");
//UuasV2nfnYU8DsjH
mongoose.connect("mongodb://127.0.0.1:27017/yaariusers");

//creating schema
const pickup = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

module.exports = mongoose.model("pickup", pickup);