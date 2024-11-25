//import
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

//membuat userschema
const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	// gender: { type: String, required: true },
	// month: { type: String, required: true },
	// date: { type: String, required: true },
	// year: { type: String, required: true },
	likedSongs: { type: [String], default: [] },
	savedSongs: { type: [String], default: [] },
	playlists: { type: [String], default: [] },
	isAdmin: { type: Boolean, default: false },
});

//buat user method yang return Json Token
userSchema.methods.generateAuthToken = function () {
	//method sign butuh 2 parameter = payload dan sign in
    const token = jwt.sign(
		{ _id: this._id, name: this.name, isAdmin: this.isAdmin, email: this.email },
		//private key to Json Web
        process.env.JWTPRIVATEKEY,
        //akan kedaluarsa setelah 7 hari
		{ expiresIn: "7d" }
	);
	return token;
};

//fungsi untuk validasi data  sebelum dikirim ke database
const validate = (user) => {
	const schema = Joi.object({
		name: Joi.string().min(5).max(10).required(),
		email: Joi.string().email().required(),
		password: passwordComplexity().required(),
		// month: Joi.string().required(),
		// date: Joi.string().required(),
		// year: Joi.string().required(),
		// gender: Joi.string().valid("male", "female", "non-binary").required(),
	});
	return schema.validate(user);
};

//user model
const User = mongoose.model("user", userSchema);
//export user model dan validate
module.exports = { User, validate };