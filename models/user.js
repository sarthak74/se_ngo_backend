var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var userSchema = new Schema({
    // aadhaar: String,
    name: String,
    contact: String,
    // otp: String,
    authDate: Date,
    otp: String,
    // language: String,
    registered: Boolean,
    currAdd: String,
    anotherNumber: String,
});


const User = mongoose.model('User', userSchema);
module.exports = User;
