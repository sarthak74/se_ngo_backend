const mongoose = require('mongoose');
const dbConfig = require('./dbConfig');

const connectDB = async() => {
    try{
        // console.log(dbConfig.uri);
        await mongoose.connect(dbConfig.uri, () => {
            console.log("Connected to DB");
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;