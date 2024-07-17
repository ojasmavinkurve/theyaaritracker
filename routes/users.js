const mongoose= require("../dbsetup");
const plm=require("passport-local-mongoose");

//mongoose.connect("mongodb://127.0.0.1:27017/yaariusers");

//creating schema
const usersSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  }
});

usersSchema.plugin(plm);
module.exports = mongoose.model("users", usersSchema);
