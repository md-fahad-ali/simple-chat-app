const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: false },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  image: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socket_id: { type: String, required: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
