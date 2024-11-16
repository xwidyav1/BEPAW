//import
const router = require("express").Router();
//import folder dan file
const { User } = require("../models/user");
const { Song, validate } = require("../models/song");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

// Create song
//hanya bisa dilakukan oleh admin
router.post("/", admin, async (req, res) => {
    //validasi input data
	const { error } = validate(req.body);
    //jika error
	if (error) res.status(400).send({ message: error.details[0].message });
    //jika tidak error
	const song = await Song(req.body).save();
	res.status(201).send({ data: song, message: "Lagu berhasil ditambahkan" });
});

// Get all songs
router.get("/", async (req, res) => {
	const songs = await Song.find();
	res.status(200).send({ data: songs });
});

// Update song
//setiap butuh parameter id berarti juga butuh validateObjectId
router.put("/:id", [validateObjectId, admin], async (req, res) => {
	const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.send({ data: song, message: "Lagu berhasil diperbarui" });
});

// Delete song by ID
router.delete("/:id", [validateObjectId, admin], async (req, res) => {
	await Song.findByIdAndDelete(req.params.id);
	res.status(200).send({ message: "Lagu berhasil dihapus" });
});

// Like song
//hanya bisa dilakukan oleh user yang sudah terontetikasi -> butuh parameter
router.put("/like/:id", [validateObjectId, auth], async (req, res) => {
	let resMessage = "";
    //cari song by ID
	const song = await Song.findById(req.params.id);
	//jika song tidak terdaftar
    if (!song) return res.status(400).send({ message: "Song does not exist" });
    //jika song terdaftar, cari user by ID
	const user = await User.findById(req.user._id);
    //cari index ID song di LikedSong milik user
	const index = user.likedSongs.indexOf(song._id);
    //jika song tidak ada di likedSong user
	if (index === -1) {
        //menambahkan song tsb ke LikedSong
		user.likedSongs.push(song._id);
		resMessage = "Berhasil ditambahkan ke liked songs!";
	} else {
        //jika song sudah ada di LikedSong, maka hapus song tsb dari LikedSong
		user.likedSongs.splice(index, 1);
		resMessage = "Berhasil dihapus dari liked songs!";
	}

	await user.save();
	res.status(200).send({ message: resMessage });
});

// Get All liked songs
//hanya bisa dilakukan oleh user yang terontetikasi
router.get("/like", auth, async (req, res) => {
    //cari user by ID
	const user = await User.findById(req.user._id);
    //return array/daftar id song yang ada di LikedSong
	const songs = await Song.find({ _id: user.likedSongs });
    //tampilkan data song dengan id-id tsb
	res.status(200).send({ data: songs });
});

//export
module.exports = router;