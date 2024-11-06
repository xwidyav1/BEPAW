const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token");
    
    // Log the token for debugging
    console.log("Received token:", token);
    
    if (!token) {
        return res.status(401).send({ message: "Access denied, no token provided." });
    }

    jwt.verify(token, process.env.JWTPRIVATEKEY, (err, validToken) => {
        if (err) {
            console.log("Token verification error:", err.message);  // Log any errors
            return res.status(400).send({ message: "Invalid token" });
        }
        req.user = validToken;
        next();
    });
};
