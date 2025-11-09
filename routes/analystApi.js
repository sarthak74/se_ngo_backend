const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Form = require('../models/form');
const twilio = require('twilio');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jwt-simple');
const config = require('../config/dbConfig');
const Analyst = require('../models/analyst');
const auth = require('../middlewares/auth');
const authCtrl = require('../controllers/authCtrl');
const { default: mongoose } = require('mongoose');
const client = new twilio(process.env.twilio_acc_sid, process.env.twilio_auth_token);

var otp = {
    max: 1048576,
    min: 1024,
};

const random_otp = () => {
    var num = Math.floor(Math.random()*(otp.max - otp.min + 1)) + otp.min;
    return num.toString();
};


router.route('/login')
.post(async(req, res) => {
    try{
        if(req.user){
            return res.status(400).json({success: false, msg: "Someone is already logged in!"});
        }
        var body = req.body;
        console.log("Login\nreq body -- ", body);
        var email = body.email;
        if(email===undefined){
            console.log("email undef");
            res.json({sucess: false, msg: 'Incorrect contact!'});
            return;    
        }

        var body = req.body;
        const user = await Analyst.findOne({'email': email});

        if(!user){
            res.status(400).send({success: false, msg: "No User found with this email"});
            return;
        }

        if(!user.registered){
            res.status(400).send({success: false, msg: "Email not registered"});
            return;
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if(!validPassword){
            res.status(400).send({success: false, msg: "Invalid Password"});
            return;
        }

        req.user = user;
        res.locals.isAuthenticated = true;

        const access_token = authCtrl.createAccessToken({ id: user._id })
        const refresh_token = authCtrl.createRefreshToken({ id: user._id })

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
        });

        res.cookie('accesstoken', access_token, {
            httpOnly: true,
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
        });

        res.status(200).send({success: true, "msg": "Logged in", user: user});
        return;

    } catch (err){
        console.log(err);
        res.status(500).json({success: false, msg: 'Some error occurred!'});
        throw err;
    }
    
});

router.route('/register')
.post(async(req, res) => {
    try{
        if(req.user){
            return res.status(400).json({success: false, msg: "Someone is already logged in!"});
        }
        console.log("register: ", req.body);

        const user = Analyst.findOne({email: req.body.email});
        if(user){
            await Analyst.deleteOne(user);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const otp = random_otp();
        //create new user
        const newUser = new Analyst({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            otp: otp,
            registered: false,
        });

        console.log(`User: ${newUser}\nOtp: ${otp}`);

        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: config.user,
        //         pass: config.pass
        //     }
        // });

        // email
        // const html = `Hi there,
        // <br/>
        // Thankyou for registering!
        // <br/><br/>
        // Please verify yor email by typing secretToken:
        // <br/>
        // Token: <b>${secretToken}</b>
        // <br/>`

        // var message = {
        //     from: config.user ,
        //     to:  req.body.email,
        //     subject: "secret token",
        //     html: html
        // };
        // console.log("mressage", message);
        // sendEmail(message);
        // transporter.sendMail(message, function(error, info) {
        //     console.log("inside mail");
        //     if(error) {
        //         console.log("mail err - ", error);
        //         return;
        //     }
        //     console.log("sent", info.response);
        // });
        // console.log("pt 6");
        //save user and respond

        await newUser.save();

        res.status(200).json(newUser);
    } catch (err) {
        console.log("register err", err);
        res.status(500).json(err)
    }
})

router.route("/verify")
  .post(async(req, res, next)=>{
    try{
        if(req.user){
            return res.status(400).json({success: false, msg: "Someone is already logged in!"});
        }
        console.log("verify", req.body);
        // find account matchs to secrettoken
        var user = await Analyst.findOne({'email': req.body.email});
        
        if(!user){
            console.log("No user found");
            // req.flash('error', 'NO user found');
            res.status(400).send({success: false, msg: "NO user found"});
            return;
        }

        if(user.registered){
            res.send({success: true, msg: "User already verified"});
            return;
        }

        if(user.otp !== req.body.otp) {
            console.log("Incorrect otp");
            res.status(400).send({success: false, msg: "Incorrect otp"});
            return;
        }
        user.otp = "";
        user.registered = true;
        const newUser = new Analyst(user);
        console.log("new user == ", newUser);
        await Analyst.updateOne({email: user.email}, newUser);
        // await newUser.save();

        res.send({success: true, msg: "Success"});

        // res.redirect('users/login');
    } catch(error) {
        console.log("verify err", err);
        res.status(500).json(err)
        next(error);
    }
});

const getDate = () => {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var d = new Date();
    var day = days[d.getDay()];
    var hr = d.getHours();
    var min = d.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var ampm = "am";
    if( hr > 12 ) {
        hr -= 12;
        ampm = "pm";
    }
    hr = hr.toString();
    if(hr.length < 2) {
        hr = "0" + hr;
    }
    var date = d.getDate();
    var month = months[d.getMonth()];
    var year = d.getFullYear();
    return date + "-" + month + "-" + year + " " + hr + ":" + min + ampm;
}

router.route('/addForm')
.post(auth.auth, async(req, res) => {
    try {
        if(!req.user){
            return res.status(400).json({success: false, msg: "Log in to add form!"});
        }
        console.log("addForm", req.body);
        var form = req.body;
        var cform = await Form.findOne({name: form.name});
        if(cform !== null){
            console.log("form name exists", cform);
            return res.status(400).send({success: false, msg: "Form name already exists"});
        }
        
        var newForm = {
            "name": form.name,
            "type": form.type,
            "fields": [
                {
                    "title": [],
                    "type": []
                }
            ],
            "owner": req.user.username,
            "createdAt": getDate()
        };

        for(let i = 0; i < form.fields.length; i++){
            newForm.fields[0].title.push(form.fields[i].name);
            newForm.fields[0].type.push(form.fields[i].type);
        }

        const saveForm = new Form(newForm);
        
        await saveForm.save();
        
        return res.status(200).send({success: true, msg: "Saved Successfully"});
    } catch (err) {
        console.log("error addForms", err);
        return res.status(500).send({success: false, err: err, msg: "Internal Server error"});
    }
});

router.route('/forms')
.get(async(req, res) => {
    try{
        console.log("get forms -- ");
        var forms = await Form.find({});
        return res.send({success: true, forms: forms});
    } catch(err){
        console.log("error in getForms -- ", err);
        return res.send({success: false});
    }
})
.delete(auth.auth, async(req, res) => {
    try {
        console.log("delete form", req.body, "\nby: ", req.user);
        if(!req.user){
            return res.status(400).json({success: false, msg: "Log in to do this"});
        }
        const owner = req.user.username;
        const keys = req.body.keys;
        const isValid = true;
        for(let i = 0; i < keys.length; i++){
            const form = await Form.findOne({ _id: mongoose.Types.ObjectId(keys[i]) });
            if(form.owner !== owner){
                isValid = false;
                break;
            }
        }
        if(!isValid){
            return res.status(403).json({success: false, msg: "Some forms aren't your"});
        }
        for(let i = 0; i < keys.length; i++){
            await Form.deleteOne({ _id: mongoose.Types.ObjectId(keys[i]) });
        }
        return res.status(200).json({success: true, msg: "Keys deleted"});

    } catch (err) {
        console.log("delete form err", err);
        return res.status(500).send({success: false, msg: "Internal Server error", err: err});
    }
})

module.exports = router;