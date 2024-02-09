require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("node:dns");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const URLModel = require("./model/urlModel.js");
const connectDB = require("./db/index.js");
const shortid = require("shortid");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", async function (req, res) {
	const urlRegex = /^(https?:\/\/)/;
	const { url } = req.body;
	console.log(url);
	if (urlRegex.test(url)) {
		const hostname = new URL(url).hostname;
		if (hostname) {
			dns.lookup(hostname, async (err, addresses) => {
				console.log(err, addresses);
				if (err) return res.json({ error: "Couldn't lookup url" });
				const shortURL = shortid.generate();
				const Model = new URLModel({
					original: url,
					shortened: shortURL,
				});
				const response = await Model.save();
				res.json({
					original_url: response.original,
					short_url: response.shortened,
				});
			});
		}
	} else {
		res.json({ error: "invalid url" });
	}
});

app.get("/api/shorturl/:shorturl", async function (req, res) {
	const shorturl = req.params.shorturl;
	const response = await URLModel.findOne({ shortened: shorturl });
	if (!response) {
		res.json({ error: "No such URL: " + shorturl });
		return;
	}
	res.redirect(response.original);
});

const start = async () => {
	try {
		const resp = await connectDB(process.env.MONGO_URI);
		app.listen(port, function () {
			console.log(`Listening on port ${port}`);
		});
	} catch (error) {
		console.log("Server error: ", error);
	}
};
start();
