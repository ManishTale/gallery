const userService=require('../services/userService');
const commonService=require('../services/commonService');
const docModel=require('../models/docModel');
const invitationModel=require("../models/invitationModel");
const sharingModel=require('../models/sharingModel');
const albumModel=require('../models/albumModel');
const userModel=require('../models/userModel');
const fs=require('fs');




//add album
exports.addAlbum = function (req, res, next) {
    var user_id=req.session.user.id;
    req.body.user_id=user_id;
     userService.addAlbum(req.body, function (error, success) {
         if (!error) {
          commonService.sendResponse(res, 200, 'success', 'success', '')
                    } else {
                      commonService.sendResponse(res, 201, 'error', error, '')
         }
     });
 };

 //get shared albums to user


exports.sharedAlbums= function (req, res,next) {

    var user_id=req.params.user_id;
   
    sharingModel.find({sharedUserId:user_id}).then(function(album){
   
               if(!album){
                commonService.sendResponse(res, 201, 'error', 'no albums found', '')
   
               }else{
                var alb=album.map(function(a){return a.albumId}); 
            
                albumModel.find({_id: { $in:alb} }).then(function(users){
                 
                    var albums = {};
                    for (var i=0; i<users.length; i++) {
                       
                    albums[users[i].albumName] = users[i]._id;
         }   
         
                        var renderParams={};
                        renderParams.albums=albums;
                        
                        res.render('user/sharedAlbums',renderParams);
                       
                     }).catch(function(error){
                        
                        commonService.sendResponse(res, 201, 'error', 'some error', '')
                 })
               }
            })
          }
//to find shared user

exports.sharedUser= function (req, res,next) {

    var albumId=req.params.albumId;
      albumModel.findOne({_id:albumId}).then(function(album){
         userModel.findOne({_id:album.userId},{_id:0,password:0,accessToken:0}).then(function(user){
           res.send(JSON.stringify(user));
        })
    })
}

//edit album 


exports.editAlbum= function (req, res,next) {
    console.log(req.body);
   var albumId=req.params.albumId;
  albumModel.updateOne({_id:albumId},{albumName:req.body.albumName}).then(function(album){
      
    commonService.sendResponse(res, 200, 'sucesss', 'sucess', '')
  }).catch(function(error){
        
    commonService.sendResponse(res, 201, 'error', 'some error', '')
  })
}

//to delete Album

exports.deleteAlbum= function (req, res,next) {
  
    var albumId=req.params.albumId;
     
    sharingModel.deleteMany({albumId:albumId}).then(function(albums){
       invitationModel.deleteMany({albumId:albumId}).then(function(inviteAlbums){
           docModel.find({albumId:albumId}).then(function(albumDocs){
               if(albumDocs.length>0){
                   let length=albumDocs.length;
                albumDocs.forEach(function(doc){
               var path=doc.path;
               path='./'+path;
               let i=0;i++;
               fs.unlink(path, function(err) {
                if(err && err.code == 'ENOENT') {
                    
                  commonService.sendResponse(res, 201, 'error', 'file doesnt exist', '')
                } else if (err) {
                    
                  commonService.sendResponse(res, 201, 'error', 'some error', '')
                } else {
                    
                  docModel.remove({_id:doc._id}).then(function(done){
                          
        
                  })
                }
            });  
            
           if(i==length-1){
                 albumModel.deleteMany({_id:albumId}).then(function(dealbums){
                  commonService.sendResponse(res, 200, 'sucess', 'sucesss', '')
                 
                 }) }  })
             }else{
               albumModel.deleteMany({_id:albumId}).then(function(dealbums){
                commonService.sendResponse(res, 200, 'sucesss', 'sucessss', '')
                }).catch(function(error){
                  commonService.sendResponse(res, 201, 'error', 'some error', '')
                })
              }
           })    
        })
      }) 
    }

   //shared to user

exports.sharedToUser= function (req, res,next) {
  
    var userId=req.params.userId;
   
    albumModel.find({userId:userId}).then(function(albums){
      try{
      if(!albums) commonService.sendResponse(res, 404, 'error', 'no albums found', '')
    else  {
        var alb=albums.map(function(a) { return a._id});
        

        sharingModel.find({ albumId: { $in: alb } }).populate('albumId').populate('sharedUserId').then(function (sharedAlbums) {

          var albumnames = sharedAlbums.map(function (a) { return a.albumId.albumName });
          var emails = sharedAlbums.map(function (b) { return b.sharedUserId.email }); 
           var data = { result: [] };
          for (var i = 0; i < albumnames.length; ++i)
            data.result.push({
              name: albumnames[i],
              email: emails[i]
            });
            
            
          res.render('user/sharedByMe', data)
          }).catch(function (error) {
            commonService.sendResponse(res, 400, 'error', 'some error', '')
          });
         }
       }catch(error){
      commonService.sendResponse(res, 400, 'error', 'some error', '')
     } 
    })
  }
  //send invitations

exports.sentInvitations = function (req, res, next) {
  var userId = req.params.userId;

  albumModel.find({ userId: userId }).then(function (albums) {

    if (!albums) commonService.sendResponse(res, 404, 'error', 'no albums found', '')
    else {
      var alb = albums.map(function (a) { return a._id });
      invitationModel.find({ albumId: { $in: alb } }).populate('albumId').then(function (invitedAlbums) {
        var emails2 = invitedAlbums.map(function (b) { return b.email });
        var albumnames2 = invitedAlbums.map(function (a) { return a.albumId.albumName });
        var albumIds2=invitedAlbums.map(function(c){return c._id});
        var data = { result: [] };
        for (var i = 0; i < albumnames2.length; ++i)
          data.result.push({
            name: albumnames2[i],
            email: emails2[i],
            albumId:albumIds2[i]
          });

        res.render('user/sentInvites', data)

      }).catch(function (error) {
        commonService.sendResponse(res, 400, 'error', 'some error', '')
    });
    }
  })
}