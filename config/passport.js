var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt
var User = require('../models/user');
var config = require('./dbConfig');

module.exports = (passport) => {
    var opts = {};
    opts.secretOrKey = config.secret
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.find({
            id: jwt_payload.id
        }, (err, user) => {
            if(err)return done(err, false);
            if(user){
                return done(null, user);
            } else {
                return done(null, false)
            }
        })
    }))
}