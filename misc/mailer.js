const nodemailer = require('nodemailer');
const config = require('../config/mailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.user,
        pass: config.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {
    sendEmail(from, to, subject, html){
        return new Promise((resolve, reject) => {
            transporter.sendMail(( from, subject, to , html), (err, info)=> {
                if(err) reject(err);
                resolve(info);
            });
        });
    }
}