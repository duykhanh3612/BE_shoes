const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  publicKey: { type: String, required: true },
  privateKey: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  // Hash the password before saving it to the database
  const user = this;
  if (user.isModified("password")) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
