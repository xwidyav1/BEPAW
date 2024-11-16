//import
const mongoose = require("mongoose");
const Joi = require("joi");

//schema untuk song
const songSchema = new mongoose.Schema({
	name: { type: String, required: true },
	artist: { type: String, required: true },
	song: { type: String, required: true },
    //    //pakai string karena kita menyimpan dalam bentuk URL image
	img: { type: String, required: true },
    //pakali string aaj karena tidak akan ada kalkulasi di BE
	duration: { type: String, required: true },
});

//fungsi untuk memvalidasi data song sebelum masuk ke database
const validate = (song) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		artist: Joi.string().required(),
		song: Joi.string().required(),
		img: Joi.string().required(),
		duration: Joi.number().required(),
	});
	return schema.validate(song);
};

//model untuk song
const Song = mongoose.model("song", songSchema);
//export model song dan fungsi validasi
module.exports = { Song, validate };