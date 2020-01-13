const userModel = require('../models/userModel');
var session=require('express-session');

var ensureAuthorized = function(req, res, next){
    var bearerToken=req.headers.token;
    

    
    // verifies secret and checks exp

    if (!bearerToken){
        return res.send({ status: "error", message: 'No token provided.' });
    }else{

        userModel.findOne({ accessToken: bearerToken }).then(user => {

            if (user) {
                console.log("hiiiiiiiiii");
                global.authenticationId = user;
                next();
            } else {
                return res.send({ status: "error", message: "Unauthenticated" })
        
            }
        })
    }   
}

exports.ensureAuthorized = ensureAuthorized;

exports.authenticateUser = function (req, res, next) {
    if (req.session.user) {
        
        next();
    } else {
        res.redirect('/login');
    }
};

exports.isLogin = function (req, res, next) {
    if (req.session.isLogin) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};