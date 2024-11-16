//import
const mongoose = require("mongoose");
const Joi = require("joi");

//kita akan butuh tipe data objectID karena kita menyimpan ID dari user dalam schema playlist
const ObjectId = mongoose.Schema.Types.ObjectId;

//schema untuk playlist
const playListSchema = new mongoose.Schema({
	name: { type: String, required: true },
    //pakai tipe data objectID
	user: { type: ObjectId, ref: "user", required: true },
	desc: { type: String },
	songs: { type: Array, default: [] },
    //pakai string karena kita menyimpan dalam bentuk URL image
	img: { type: String },
});

//fungsi untuk validasi data sebelum dikiirm ke database
const validate = (playList) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		user: Joi.string().required(),
		desc: Joi.string().allow(""),
		songs: Joi.array().items(Joi.string()),
		img: Joi.string().allow(""),
	});
	return schema.validate(playList);
};

const PlayList = mongoose.model("playList", playListSchema);

module.exports = { PlayList, validate };