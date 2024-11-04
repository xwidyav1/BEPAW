const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB);
        console.log("Connected to Database Successfully");
    } catch (error) {
        console.error("Couldn't connect to DB:", error);
    }
}
