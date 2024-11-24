const router = require("express").Router();
//import fungsi user dan validate dari folder models -> user
const { User, validate } = require("../models/user");
//untuk hashing password 
const bcrypt = require("bcrypt");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");

// create user
router.post("/", async (req, res) => {
    //validasi data yang dimasukkan user
	const { error } = validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

    //mengecek dat aemail yang dimasukkan user apakah already exist di db?
	const user = await User.findOne({ email: req.body.email });
	if (user)
        //jika email tsb ditemukan di db
		return res
			.status(403)
			.send({ message: "User dengan email tersebut sudah terdaftar!" });

	//convert enviroment variable ke angka (number)
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
	//pakai method bcrypt.hash untuk hashing password
    //method ini buth 2 parameter = password dan salt
    const hashPassword = await bcrypt.hash(req.body.password, salt);
	
    //membuat user baru (utk sign-in)
    let newUser = await new User({
        //operator utk copy semua elemen/data yang diamsukkan user kecuali password
		...req.body,
        //password pakai yang sudah di hash
		password: hashPassword,
	}).save();

    //password hanya akan undified di objek ini saja
    //jadi password string tidak akan pernah berubah sehingga user/client tdk perlu mengubah2 password
	newUser.password = undefined;
	newUser.__v = undefined;
	res
		.status(200)
		.send({ data: newUser, message: "Akun berhasil dibuat" });
});

// get all users
router.get("/", admin, async (req, res) => {
    //kita tdk ingin send password to client
	const users = await User.find().select("-password -__v");
	res.status(200).send({ data: users });
});

// get user by id
//perlu validateObjectId untuk validasi ID dan user perlu di otentikasi
router.get("/:id", [validateObjectId, auth], async (req, res) => {
	const user = await User.findById(req.params.id).select("-password -__v");
	res.status(200).send({ data: user });
});

// update user by id
router.put("/:id", [validateObjectId, auth], async (req, res) => {
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ $set: req.body },
		{ new: true }
	).select("-password -__v");
    //kecuali password
	res.status(200).send({ data: user, message: "Profile berhasil diperbarui" });
});

// delete user by id
//cuma  boleh dilakukan oleh admin
router.delete("/:id", [validateObjectId, admin], async (req, res) => {
	await User.findByIdAndDelete(req.params.id);
	res.status(200).send({ message: "User berhasil dihapus" });
});

module.exports = router;