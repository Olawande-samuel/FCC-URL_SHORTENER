const mongoose = require("mongoose");

const URLSCHEMA = new mongoose.Schema({
	original: { type: String, required: true },
	shortened: { type: String, required: true },
});

const model = mongoose.model("url", URLSCHEMA);

module.exports = model;
