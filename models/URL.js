var mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: {
    type: Number,
    default: 0,
  },
});

const URL = mongoose.model("URL", urlSchema);

module.exports = URL;
