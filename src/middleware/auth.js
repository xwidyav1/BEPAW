const jwt = require("jsonwebtoken");

//pakai tambahan parameter next, next akan dipanggil setelah memanggil fungsi export
module.exports = (req, res, next) => {
    //cek apakah token available 
	const token = req.header("x-auth-token");
	//jika tidak available, return pesan error
		if (!token)
			return res
				.status(400)
				.send({ message: "Access denied, no token provided." });
    //jika token available, verifikasi dengan jwt
	jwt.verify(token, process.env.JWTPRIVATEKEY, (err, validToken) => {
		//jika token invalid
        if (err) {
			return res.status(400).send({ message: "invalid token" });
		} else {
            //jika valid, user akan jadi token yang valid
			req.user = validToken;
			next();
		}
	});
};