var User = require('../models/user');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const Analyst = require('../models/analyst');

const auth = async(req, res, next) => {
    try {
        
        const token = req.cookies.refreshtoken;
        if (token) {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
            if (decoded) {
                const user = await Analyst.findOne({ _id: mongoose.Types.ObjectId(decoded.id) })
                req.user = user
            }
            
        }
        next()
        
        
    } catch (err) {
        console.log("auth err -- ", err);
        // return res.send({success: false});
        return res.status(500).json({ success: false, msg: err.message })
    }
}

const userAuth = async(req, res, next) => {
    try {
        
        const token = req.cookies.refreshtoken;
        if (token) {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
            if (decoded) {
                const user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.id) })
                req.user = user
            }
            
        }
        next()
        
        
    } catch (err) {
        console.log("auth err -- ", err);
        // return res.send({success: false});
        return res.status(500).json({ success: false, msg: err.message })
    }
}


module.exports = {
    auth, userAuth
};