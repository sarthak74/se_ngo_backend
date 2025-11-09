var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var personSchema = new Schema({
    surveyType: String,
    formName: String,
    fields: Object
});


const Person = mongoose.model('Person', personSchema);
module.exports = Person;

