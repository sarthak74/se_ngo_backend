var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var analystSchema = new Schema({
    username: String,
    email: String,
    password: String,
    authDate: Date,
    otp: String,
    registered: Boolean,
    currAdd: String,
    anotherNumber: String,
});


const Analyst = mongoose.model('Analyst', analystSchema);
module.exports = Analyst;
