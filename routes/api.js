const express = require('express');
const router = express.Router();
const User = require('../models/user');
const twilio = require('twilio');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jwt-simple');
const config = require('../config/dbConfig');
const client = new twilio(process.env.twilio_acc_sid, process.env.twilio_auth_token);

var otp = {
    max: 1048576,
    min: 1024,
};

var random_otp = () => {
    var num = Math.floor(Math.random()*(otp.max - otp.min + 1)) + otp.min;
    return num.toString();
};

router.route('/auth')
.post(async(req, res) => {
    try{
        var body = req.body;
        console.log("req body -- ", body);
        var contact = body.contact;

        if(contact.length !== 10){
            res.json({sucess: false, msg: 'Incorrect contact!'});
            return;    
        }
        contact = ("+91"+contact);
        console.log("contact -- ", contact);
        console.log("validated");

        var body = req.body;

        User.findOne({'contact': body.contact}, async(err, usr) => {
            if(err) throw err;
            console.log("user -- ", usr);
            var flag = 0;
            if(usr){
                flag = 1;
            }

            var otp_number = random_otp(), newuser;

            console.log("Otp -- ", otp_number);

            body.otp = otp_number;

            var date = new Date();
            console.log("date -- ", date);
            body.authDate = date;
            body.name = "";
            body.currAdd = "";
            body.anotherNumber = "";
            if(flag == 0){

                body.registered = false;
                newuser = new User(body);

                await newuser.save();
                console.log("new user saved");
            }

            await User.updateOne({contact: body.contact}, { $set: {otp: otp_number}});

            var user = body, contact = ('+91'+body.contact).toString();

            var txt = "SMS from Gumnam SE Backend.\nYour otp is: ";
            txt+=(otp_number).toString();
            txt+="\n";

            var token = jwt.encode(user, process.env.secret), decoded;
            
            try{
                decoded = await jwt.decode(token, process.env.secret);
                
            } catch (err){
                res.send({success: false, msg: 'Some server error occurred! Please retry', token: token});
                throw err;

            }
            
            if(decoded){
                // try{
                //     await client.messages.create({
                //         to: contact,
                //         body: txt,
                //         from: process.env.twilio_from
                //     }).then(async(message) => {
                //         if(message.errorMessage){
                //             res.send({success: false, msg: 'Failed sending otp, check the number you entered!'});    
                //             return;
                //         }

                        res.send({success: true, msg: 'Otp sent successfully!', token: token});
                //     }).done();
                // } catch (err){
                    // res.send({success: false, msg: 'Failed sending otp, check the number you entered!'});    
                // }
            } else {
                res.send({success: false, msg: 'Server error, Please retry'});    
            }
            
            
            return;

        });

    } catch (err){
        console.log(err);
    }
    
});

router.route('/register')
.post(async(req, res) => {
    try{
        var body = req.body.data;
        console.log("registering", body);
        var user = await User.findOne({contact: body.contact});
        if(!user){
            res.json({success: false, msg: "You have to register you contact first"});
            return;
        }
        if(user.registered === true){
            res.json({success: false, msg: "User already registered"});
            return;
        }
        console.log("user -- \n", body.contact, "\n", user);
        

        await User.updateOne({contact: body.contact}, { $set: {
            registered: true,
            currAdd: body.currAdd,
            anotherNumber: body.anotherNumber,
            name: body.name,
        }});

        console.log("Updated");

        res.json({success: true, msg: "You are successfully registered"});

        // if(!user){
        //     res.json({success:fa})
        // }
    } catch (err) {
        console.log("Error: ", err);
        res.json({success: false, msg: err});
    }
})



router.route('/otpverify')
.post(async(req, res) => {
    try{
        var contact, name;
        if(req.headers.authorization){
            var token = req.headers.authorization;
            var decodedtoken = await jwt.decode(token, config.secret);
            contact = decodedtoken.contact;
            name = decodedtoken.name;
        } else {
            res.send({success: false, msg: 'Invalid Authorization', contact: contact, isregistered: false});
            return;
        }

        var userOtp = req.body.otp;

        User.findOne({'contact': contact}, async (err, user) => {

            if(err)throw err;
            
            if(!user || user.contact!==contact){
                res.send({success: false, msg: 'Enter your Phone number correctly', contact: contact, isregistered: false});
                return;
            }
            if(user.otp !== userOtp){
                res.send({success: false, msg: 'Incorrect Otp', contact: contact, isregistered: false});
                return;
            }
            await User.updateOne({'contact': contact}, { $set: {'otp': ''} });
            var msg = "You have to register yourself";
            if(user.registered){
                msg = "You are logged in now";
            }
            res.send({success: true, msg: msg, isregistered: user.registered, contact: contact, name: name});
        });

    } catch (err) {
        console.log("Error while verifying user");
    }
});

router.route('/getForms')
.post(async(req, res) => {
    try{
        var body = req.body;
        console.log("body -- ", body);
    } catch (err){
        console.log("error in get forms -- ", err);
    }
});

module.exports = router;