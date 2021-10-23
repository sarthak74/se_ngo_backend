const express = require('express');
const morgan  = require('morgan');
const dotenv = require('dotenv');
dotenv.config()
const connectDB = require('./config/db');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
var Person = require('./models/person');
const PORT = process.env.PORT || 4000;
// const hostname = process.env.hostname || '127.0.0.1';

connectDB();

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));

var engine = require('consolidate');

app.set('views', __dirname + '/views');
app.engine('html', engine.mustache);
app.set('view engine', 'html');


app.use(morgan('dev'));


var server = require('http').createServer(app);

const WebSocket = require('ws');

var wss = new WebSocket.Server({port: 4001});

wss.on('connection', (ws, req) => {

  try{
  
    const clientIP = req.connection.remoteAddress;
    console.log("Someone Connected -- ", clientIP); 
    
    ws.send("sid-1111", () => {
      console.log("Sending data");
    });
    
    ws.on('message', async(msg) => {
      
      var data = msg.toString().split('"');
      
      data = data[15];
      
      // var dv = data["DataValue"].toString();
      var ddv = JSON.parse((JSON.stringify(Buffer.from(data, 'base64').toString())));
      

      var jd = {};

      var ar = ddv.split(",");

      for(let i=0;i<ar.length;i++){
        var x = ar[i];
        var kv = x.split(":");
        var kp = kv[0].split('"');
        console.log(kp);
        var k = kp[1];
        var vp = kv[1].split('"');
        console.log(vp);
        var v = vp[1];
        jd[k] = v;
      }

      console.log("Data -- ", jd);

      // await Person(jd).save();
      
      
      
    });
  } catch (err) {
    console.log("socket error -- ", err);
  }
});

server.listen(PORT, () => {console.log("Server started at "+PORT)});