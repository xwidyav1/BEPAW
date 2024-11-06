const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    month: {type: String, required: true},
    date: {type: String, required: true},
    year: {type: String, required: true},
    likedSongs: {type: [String], default: []},
    playlists: {type: [String], default:[]},
    isAdmin: {type: Boolean, default: false}
})


userSchema.methods.generateAuthToken = function (){
    const token = jwt.sign(
        {_id:this._id, username: this.username, isAdmin: this.isAdmin},
        process.env.JWTPRIVATEKEY,
        {expiresIn: "7d"}
    )
    return token;
}

const validate = (user) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
        month: Joi.string().required(),
        date: Joi.string().required(),
        year: Joi.string().required(),
    })
    return schema.validate(user)
}

const User = mongoose.model("user", userSchema);

module.exports = {User,validate};