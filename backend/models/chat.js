const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: String,
  fromUsername: String,
  fromUserFullname: String,
  toUsername: String,
  toUserFullname: String,
  file: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
