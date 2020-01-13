const userModel = require('../models/userModel');
var bcrypt = require('bcrypt');
var albumModel=require('../models/albumModel');
var sharingModel=require('../models/sharingModel');
var invitationModel=require('../models/invitationModel');





const commonService = require('../services/commonService');

//to login
exports.login = function (data, callback) {
    console.log("email", data.email)
    userModel.findOne({ email: data.email }, function (error, user) {
        if (user) {


            bcrypt.compare(data.password, user.password, function (err, res) {
                if (res == true) {
                    const randomNumber = Math.floor(Math.random() * 10000000000 + 1);
                    let token = randomNumber;
                   
                    user.token=token;
                    userModel.updateOne({ email: data.email }, { accessToken: token }).then(function(users){
                       
                        callback(null, user);
                    });
                  
                } else {
                    callback('Invalid Password!!', {});
                }
            })

        } else if (error) {
            callback('some error', {});
        } else {
            callback('No user found!', {});
        }
    });
};




//to register user
exports.register = function (data, callback) {

    return new Promise(function (resolve, reject) {
        
        userModel.findOne({ email: data.email }).then(async function (userID) {
            if (userID) {
                resolve(userID);
                callback("user already registered", {})
            } else {
                 await bcrypt.hash(data.password.toString(), 10, function (err, passHash) {
                   if (err)  callback("some error", {})
                    let user = new userModel({
                        userName: data.Username,
                        email: data.email,
                        password: passHash,
                        accessToken: '',

                    });
                     user
                        .save()
                        .then(function (userData) { var obj={}
                            invitationModel.find({email:data.email,active:'false'}).then(async function(requests){
                                if(requests){
                                requests.forEach(function(req){
                                  
                                     let sharing=new sharingModel({
                                        albumId:req.albumId,
                                          sharedUserId:userData._id
                                          
                                     });
                                   sharing.save().then(function(sharedData){ 
                                             invitationModel.deleteOne({email:data.email,active:'false'},function(err,data){
                                                if(err) callback('some error',{});
                                                 
                                               
                                           })       
                                      }) })
                           
                            }else{
                                resolve(userData);
                                callback(null,userData)
                            }  
                       }).then(function(last){
                            resolve(userData);
                            callback(null,userData)
                    }) }).catch(function (error) {
                        callback("user already registered", {})
                        reject(error);
                });
             })
               }
        }).catch(function (err) {
            callback('some error', {})
            reject(err);

        })
    })
};



//logout
exports. logout = (data,callback) => {
        return new Promise(function(resolve, reject) {
      userModel.update({ _id: data.user_id }, { accessToken: "" })
        .then(function(signOut) {
          resolve(signOut);
        callback(null,data.id)
        })
        .catch(function(err) {
          reject(err);
          callback('some error',err);
        });
    });
  };
  
//to add album
  exports.addAlbum = function (data, callback) {
 
    if(!data.albumName){
         
        callback('album name not provided',{})
          }else{
           albumModel.findOne({albumName:data.albumName,userId:data.user_id}).then(function(name){
               if(name){
                callback('same name exists',{});     
               }else{
                let album = new albumModel({
                    albumName: data.albumName,
                    userId: data.user_id,
                            });
                           
                        album.save().then(function(album){
                          
                           callback(null,album)
               }).catch(function(error){
                  
                callback('name size between 4 to 15 char',{});  
            })
         }
           })
            
           .catch(function(error){
               callback('some error',{});  
           })
           }
        }

//get dashboard

exports.getDashboard = function (data, callback) {
 
    albumModel.find({userId:data.user_id}).then(function(albums){
        
      if(albums)  { 

          callback(null,albums)
    }
      else {callback('some error','') };
     })
    }


//to share gallery

exports.share = function (data, callback) {
 
    userModel.findOne({email:data.to}).then(function(user){
       
      if(user) {
          sharingModel.findOne({sharedUserId:user._id,albumId:data.albumId}).then(function(usr){
        if(!usr){
          var sharing=new sharingModel({
                sharedUserId:user._id,
                albumId:data.albumId
              })
              sharing.save().then(function(shared){
                  callback(null,'shared');
              })  }else{
                  callback(null,'already shared')
              } })
    }
      else { callback('not registered',{}) };

    })
 }

 
