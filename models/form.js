const mongoose = require('mongoose');
const Schema = mongoose.Schema

const FormSchema = new Schema({
    name: {
        type: String,
        required: [true, "Formname is required"]
    }, 
    type: {
        type: String,
        required: [true, "Formtype is required"]
    }, 
    fields: {
        type: Object,
        required: [true, "min no. of fields = 3"]
    },
    createdAt: {
        type: String
    },
    owner: {
        type: String,
        required: [true, "Owner of form is required"]
    }
})

const Form = mongoose.model("Form", FormSchema);
module.exports = Form;

/*

{
    "name": "Form1",
    "surveyType": "Health",
    "type": "Health",
    "fields": [
        {
            "title": ["f1", "f2", "f3", "f4"],
            "type": ["Text", "Number", "Text", "Number"],
        }
    ]
}

*/