const express = require('express');
const morgan  = require('morgan');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
var engine = require('consolidate');
var Person = require('./models/person');
const WebSocket = require('ws');


const PORT = process.env.PORT || 4000;
dotenv.config()
connectDB();


const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.set('views', __dirname + '/views');
app.engine('html', engine.mustache);
app.set('view engine', 'html');



app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/analyst/api', require('./routes/analystApi'));



var server = require('http').createServer(app);

var wss = new WebSocket.Server({port: 4001});

var getId = (person) => {
  var keys = ["adhar", "Adhar", "aadhar", "Aadhar", "adhaar", "Adhaar", "aadhaar", "Aadhaar"];
  for(let i = 0; i < keys.length; i++){
    var key = keys[i];
    if(person[key] !== undefined && person[key] !== null) return person[key];
  }

}

wss.on('connection', (ws, req) => {
  try{
    const clientIP = req.connection.remoteAddress;
    // console.log("Connection attempt -- ", clientIP); 
    ws.send("sid-1111", () => {
      // console.log("Established");
    });
    ws.on('message', async(msg) => {
      var pmsg = await JSON.parse(msg);
      var ddv = await JSON.parse((Buffer.from(pmsg["DataValue"], 'base64').toString()));
      ddv["surveyType"] = ddv["fields"]["surveyType"];
      ddv["formName"] = ddv["fields"]["formName"];
      var id = getId(ddv["fields"]);
      var newperson = new Person(ddv);
      await newperson.save();
      console.log("[.] new person id - ", id);
    });
  } catch (err) {
    console.log("socket error -- ", err);
  }
});

server.listen(PORT, () => {console.log("Server started at "+PORT)});