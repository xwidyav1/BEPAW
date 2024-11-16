//import router
const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

//pakai post request utk otentikasi karena highly secured
router.post("/", async (req, res) => {
    //cek apakah email sudah terdaftar
	const user = await User.findOne({ email: req.body.email });
	//jika email tdk ditemukan di db
    if (!user)
		return res.status(400).send({ message: "Email atau password kamu invalid!" });
    //kalau email ada, validasi password
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	//kalau password tdk valid
    if (!validPassword)
		return res.status(400).send({ message: "Email atau password kamu invalid!" });

    //jika kedua email dan password valid
	const token = user.generateAuthToken();
	res.status(200).send({ data: token, message: "Sedang proses signing in, mohon ditunggu..." });
});

module.exports = router;