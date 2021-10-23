var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var personSchema = new Schema({
    surveyType: String,
    aadhaar: String,
    name: String,
    age: String,
    gender: String,
    education: String,
    address: String,
    city: String,
    maritalStatus: String,
    district: String,
    state: String,
});


const Person = mongoose.model('Person', personSchema);
module.exports = Person;

