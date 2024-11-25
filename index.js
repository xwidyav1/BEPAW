require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./src/routes/users");
const authRoutes = require("./src/routes/auth");
const songRoutes = require("./src/routes/songs");
const playlistRoutes = require ("./src/routes/playlists");
const searchRoutes = require("./src/routes/search");
const app = express();

connection()
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/login", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/", searchRoutes);

const port = process.env.PORT ||8080;
app.listen(port,console.log(`listening on port${port}..`))
module.exports = app;
