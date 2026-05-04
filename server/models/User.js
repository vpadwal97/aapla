const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    name: String,
    photoURL: String,
    provider: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
