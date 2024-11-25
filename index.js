//import module
require("dotenv").config();
require("express-async-errors");
const express = require('express');
const cors = require("cors");
//import db file
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");
const playListRoutes = require("./routes/playlists");
const searchRoutes = require("./routes/search");
const app = express();

//memanggil function connection
connection()
app.use(cors({
    origin: "http://localhost:5174", // URL front-end
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use(express.json());

app.use("/api/users/", userRoutes);
app.use("/api/login/", authRoutes);
app.use("/api/songs/", songRoutes);
app.use("/api/playlists/", playListRoutes);
app.use("/api/", searchRoutes);

//port variable
const port = process.env.PORT || 8080;
//port-nya dinamis
app.listen(port, console.log(`Listening on port${port}...`))
