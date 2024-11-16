//import
const router = require("express").Router();
//import folder dan file
const { PlayList, validate } = require("../models/playList");
const { Song } = require("../models/song");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const Joi = require("joi");

// create playlist
//hanya bisa dilakukan oleh user yang sudah terontetikasi -> butuh parameter auth
router.post("/", auth, async (req, res) => {
	//validasi input
	const { error } = validate(req.body);
	//jika tidak valid
	if (error) return res.status(400).send({ message: error.details[0].message });

	//jika valid
	//get user id
	const user = await User.findById(req.user._id);
	//buat playlist --> copy body/data inputan
	const playList = await PlayList({ ...req.body, user: user._id }).save();
	//add id playlist ini ke array playlist user
	user.playlists.push(playList._id);
	await user.save();

	res.status(201).send({ data: playList });
});

//edit playlist by id
//setiap butuh parameter id berarti juga butuh validateObjectId
router.put("/edit/:id", [validateObjectId, auth], async (req, res) => {
	//buat schema untuk validasi data input: nama playlist, deskripsi, dan image
	const schema = Joi.object({
		name: Joi.string().required(),
		desc: Joi.string().allow(""), //allow empty string
		img: Joi.string().allow(""), ////allow empty string
	});
	const { error } = schema.validate(req.body);
	//jika terjadi error
	if (error) return res.status(400).send({ message: error.details[0].message });

	//cari playlist by id
	const playlist = await PlayList.findById(req.params.id);
	//jika id playlist tidak ditemukan
	if (!playlist) return res.status(404).send({ message: "Playlist tidak ditemukan" });

	//cari user by id
	const user = await User.findById(req.user._id);
	//jika user bukan pemilik playlist (bukan user yg bikin playlistnya -> id user yg tertaut ke playlist tdk sesuai)
	if (!user._id.equals(playlist.user))
		return res.status(403).send({ message: "User tidak punya akses untuk mengedit playlist ini!" });

	//jika user dan playlist sesuai (user adl pemilik playlist), maka update
	playlist.name = req.body.name;
	playlist.desc = req.body.desc;
	playlist.img = req.body.img;
	await playlist.save();

	res.status(200).send({ message: "Playlist berhasil diperbarui" });
});

// add song to playlist
router.put("/add-song", auth, async (req, res) => {
	const schema = Joi.object({
		playlistId: Joi.string().required(),
		songId: Joi.string().required(),
	});
	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	const user = await User.findById(req.user._id);
	const playlist = await PlayList.findById(req.body.playlistId);
	if (!user._id.equals(playlist.user))
		return res.status(403).send({ message: "User tidak punya akses untuk menambahkan lagu ke playlist ini!" });

	//cek apakah song sudah masuk ke playlist atau belum
	if (playlist.songs.indexOf(req.body.songId) === -1) {
		//jika belum ada di playlist, tambahkan song
		playlist.songs.push(req.body.songId);
	}
	//jika song sudah ada di playlist, kita biarkan saja (.save)
	await playlist.save();
	res.status(200).send({ data: playlist, message: "Lagu berhasil ditambahkan ke playlist" });
});

// remove song from playlist
router.put("/remove-song", auth, async (req, res) => {
	const schema = Joi.object({
		playlistId: Joi.string().required(),
		songId: Joi.string().required(),
	});
	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	const user = await User.findById(req.user._id);
	const playlist = await PlayList.findById(req.body.playlistId);
	//jika user bukan pemilik playlist (bukan user yg bikin playlistnya -> id user yg tertaut ke playlist tdk sesuai)
	if (!user._id.equals(playlist.user))
		//tidak boleh remove song tsb
		return res
			.status(403)
			.send({ message: "User tidak punya akses untuk menghapus lagu ke playlist ini!" });

	//kalau usernya sesuai, cari index song-nya di playlist (melalui id song)
	const index = playlist.songs.indexOf(req.body.songId);
	//remove
	playlist.songs.splice(index, 1);
	await playlist.save();
	res.status(200).send({ data: playlist, message: "Lagu berhasil dihapus dari playlist" });
});

// get playlists yang dibuat user tertentu
router.get("/favourite", auth, async (req, res) => {
	const user = await User.findById(req.user._id);
	const playlists = await PlayList.find({ _id: user.playlists });
	res.status(200).send({ data: playlists });
});

// get random playlists
router.get("/random", auth, async (req, res) => {
	//sende them in array of object dan sample size = 10
	const playlists = await PlayList.aggregate([{ $sample: { size: 10 } }]);
	res.status(200).send({ data: playlists });
});

// get playlist by id
router.get("/:id", [validateObjectId, auth], async (req, res) => {
	const playlist = await PlayList.findById(req.params.id);
	//jika playlist dgn id tsb tdk ada/ditemukan
	if (!playlist) return res.status(404).send("Playlist tidak ditemukan");

	//jika playlist ada, tampilkan lagu2 yg cuma ada (available) di playlist tsb
	//kalau lagunya ngga ada di palylist ngga ditampilkan
	const songs = await Song.find({ _id: playlist.songs });
	res.status(200).send({ data: { playlist, songs } });
});

// get all playlists
router.get("/", auth, async (req, res) => {
	const playlists = await PlayList.find();
	res.status(200).send({ data: playlists });
});

// delete playlist by id
router.delete("/:id", [validateObjectId, auth], async (req, res) => {
	const user = await User.findById(req.user._id);
	const playlist = await PlayList.findById(req.params.id);
	//jika user bukan pemilik playlist
	if (!user._id.equals(playlist.user))
		return res
			.status(403)
			.send({ message: "User tidak punya akses untuk menghapus playlist ini!" });
	
	//jika user adl pemilik playlist
	//cari index song-nya di playlist (melalui id song)
	const index = user.playlists.indexOf(req.params.id);
	//remove
	user.playlists.splice(index, 1);
	await user.save();
	await playlist.remove();
	res.status(200).send({ message: "Playlist berhasil dihapus dari library kamu!" });
});

//export
module.exports = router;