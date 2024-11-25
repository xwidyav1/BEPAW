//import module
require("dotenv").config();
require("express-async-errors");
const express = require('express');
const cors = require("cors");
//import db file
const connection = require("./db");
const userRoutes = require("./src/routes/users");
const authRoutes = require("./src/routes/auth");
const songRoutes = require("./src/routes/songs");
const playListRoutes = require("./src/routes/playlists");
const searchRoutes = require("./src/routes/search");
const app = express();

//memanggil function connection
connection()
app.use(cors({
    origin: "https://front-end-paw.vercel.app/", // URL front-end
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Melodify Ready");
  });

app.use("/api/users/", userRoutes);
app.use("/api/login/", authRoutes);
app.use("/api/songs/", songRoutes);
app.use("/api/playlists/", playListRoutes);
app.use("/api/", searchRoutes);

//port variable
const port = process.env.PORT || 8080;
//port-nya dinamis
app.listen(port, console.log(`Listening on port${port}...`))
