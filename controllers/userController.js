const userService=require('../services/userService');
const commonService=require('../services/commonService');
const nodemailer = require('nodemailer');
const invitationModel=require("../models/invitationModel");
const userModel=require('../models/userModel');
const bcrypt=require("bcrypt");






//login
exports.login = function (req, res, next) {
    console.log("email",req.body.email)
    userService.login(req.body, function (error, success) {

        if (!error) {
        
             var obj = {};
            obj.userName = success.userName;
            obj.id = success._id;
            obj.email=success.email;
            req.session.user= obj;
           commonService.sendResponse(res, 200, 'success', 'success','');
        } else {
          commonService.sendResponse(res, 201, 'some error', error,'');
         }
    });
};
//register
exports.registration = function (req, res, next) {
    if(req.body.password!==req.body.confirmPassword){
      commonService.sendResponse(res, 201, 'some error', 'PASSWORD & CONFIRM_PASSWORD not same','');
     }
    userService.register(req.body, function (error, success) {
        if (!error) {
            renderParams={
                email:success.email
            }
            commonService.sendResponse(res, 200, 'success', 'success','');
         } else {
          commonService.sendResponse(res, 201, 'some error', error,'');
        }
    });
};
//logout
var logout = function(req, res, next){
    var user_id=req.session.user.id;
    req.body.user_id=user_id;
    userService.logout(req.body,function(error,success){
      if(!error){
        res.cookie('connect.sid', {expires: new Date(0)});
       
           res.redirect('/login');
           }
     else{
        commonService.sendResponse(res, 201, 'error', 'Some error', error);
    } });
}
exports.logout = logout;


//get dashboard

exports.getDashboard = function (req, res, next) {
    var user_id=req.session.user.id;
   req.body.user_id=user_id;
   
  var renderParams={};
    userService.getDashboard(req.body,function (error, dashboard) {
     if(error)  commonService.sendResponse(res, 201, 'error', 'Some error', error);
        if (dashboard) { 
            var albums = {};
           for (var i=0; i<dashboard.length; i++) {
              
           albums[dashboard[i].albumName] = dashboard[i]._id;
}          
            renderParams.albums=albums;
            renderParams.user_id=user_id;  
        }
        
        res.render('user/dashboard1', renderParams);
    });
}




//to send mail

exports.inviteUser= function (req, res,next) {
    var albumId=req.params.albumId;
  
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'hdsolulab@gmail.com',
          pass: '9106376261'
        }
      });
         invitationModel.findOne({albumId:albumId,email:req.body.email}).then(function(find){
                       if(!find){
                        const randomNumber = Math.floor(Math.random() * 10000000000 + 1);
                        let recovery_token = randomNumber;
                        let mailOptions = {
                            from: 'hdsolulab@gmail.co', // sender address
                            to: req.body.email, // list of receivers
                            subject: 'shared a web gallery', // Subject line
                             text: 'click the limk below to get register! Thankyou',
                             html: '<p>Click <a href="http://localhost:3000/verifyRegister/' + recovery_token + '"> click here</a> to register yourself!</p>'// html body
                        };
                          
                           
                         transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                              return res.send("some error");
                            }
                             let invitation=new invitationModel({
                                 email:req.body.email,
                                 albumId:albumId,
                                 token:recovery_token,
                                 active:'false'
                             })
                                invitation.save(function(succes){
                                  
                                   return res.send("shared mail");
                             })
                           
                            });
                           }else{
                            return res.send("album already shared"); 
                           }   
                            
                       })  
                    }


//to verify register
exports.verifyRegister= function (req, res,next) {

 var token=req.params.token;

 invitationModel.findOne({token:token,active:'false'}).then(function(user){

            if(!user){
              commonService.sendResponse(res, 404,  'some error', 'Bad request','');

            }else{
                 var renderParams={email:user.email
                }
                 res.render('user/verifyRegistration',renderParams);
              
             }
          })
        }


  
//update userInfo

var updateUserInfo = async function (req, res, next) {
  var user_id=req.session.user.id;
     
  
    if (req.body.email || req.body.userName || (req.body.oldPassword && req.body.newPassword)) {
        userModel.findOne({_id:user_id }, function (err, userData) {
            if (err) {
              commonService.sendResponse(res, 400,  'some error', 'ERROR IN finding user','');
            } if (!userData) {
              commonService.sendResponse(res, 400,  'some error', 'User not found','');
            } else {
                var userName = userData.userName;
                var email = userData.email;
                var password = userData.password;

                if (req.body.email) {
                    email = req.body.email;
                }
                if (req.body.userName) {
                    userName = req.body.userName;
                }
                if (req.body.oldPassword) {
                    oldPassword = bcrypt.compareSync(req.body.oldPassword, userData.password);
                    if (!oldPassword) {
                      commonService.sendResponse(res, 400,  'some error', 'PASSWORD IS NOT SAME','');
                    }
                    if (req.body.newPassword) {
                       password = bcrypt.hashSync(req.body.newPassword, 10);
                    }
                }
            }
            userModel.findOneAndUpdate({ _id:user_id }, { $set: { userName: userName, email: email, password: password } },
                function (err, EditData) {
                    if (err) {
                      commonService.sendResponse(res, 201,  'some error', 'some error','');
                    } else {
                      commonService.sendResponse(res, 200,  'success','DATA EDITED SUCCESSFULLY','');
                    }
                })
              })
           }
    else {
      commonService.sendResponse(res, 400,  'some error', 'DATA REQUIRED','');
    }
};
    


  exports.updateUserInfo = updateUserInfo;

  //share user
  
  exports.shareUser= function (req, res,next) {
    var albumId=req.params.albumId;
    req.body.albumId=albumId;
        userService.share(req.body,function (error,to) {
     

          if (!error) {
            commonService.sendResponse(res, 200, 'success', 'Success','');
          } else{
              commonService.sendResponse(res, 201, 'error', error,'');
           }
       })
    }   

