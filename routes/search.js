//import
const router = require("express").Router();
//import folder dan file
const { Song } = require("../models/song");
const { PlayList } = require("../models/playList");
const auth = require("../middleware/auth");

//pencarian lagu hanya bisa dilakukan oleh user yang terontetikasi 
router.get("/", auth, async (req, res) => {
    //membuat fungsi search
	const search = req.query.search;
    //jika yang di search bukan empty
	if (search !== "") {
        //cari lagu/playlist tsb
		const songs = await Song.find({
            //hanya mencari lagu yang mengandung kata/word dalam kolom pencarian
			name: { $regex: search, $options: "i" },
		}).limit(10);
		const playlists = await PlayList.find({
            //hanya mencari lagu yang mengandung kata/word dalam kolom pencarian
			name: { $regex: search, $options: "i" },
		}).limit(10);
        //result/hasil pencarian adalah song dan playlist tsb (hasil pencarian di atas)
		const result = { songs, playlists };
		res.status(200).send(result);
	} //jika yang di search adalah empty
    else {
		res.status(200).send({});
	}
});

//export
module.exports = router;