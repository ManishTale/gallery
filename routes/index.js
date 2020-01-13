var express = require('express');
var router = express.Router();
const userController=require("../controllers/userController");
const auth=require('../middlewere/auth');
const commonService=require('../services/commonService')
const albumController=require('../controllers/albumController');
const documentController=require('../controllers/documentController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});
router.get('/registration',function(req,res,next){
 res.render("user/registration") 
});
router.get('/login',auth.isLogin,function(req,res,next){
res.render('login')
});
router.post('/login', userController.login);
router.post('/registration', userController.registration);
router.get('/dashboard',auth.authenticateUser,userController.getDashboard);
router.get('/signout',auth.authenticateUser, userController.logout);
router.post('/addAlbum',auth.authenticateUser,albumController.addAlbum);
router.get ('/addalbum',auth.authenticateUser,function(req,res,next){
  res.render('user/addAlbum');
})
router.get('/uploadDocument/:albumId',auth.authenticateUser,function(req,res){
  var albumId=req.params.albumId;
  var renderParams={albumId:albumId};
  res.render('user/fileUpload',renderParams);
});  
router.post('/uploadDocument/:albumId',auth.authenticateUser,documentController.uploadDocument);
router.get('/documents/:albumId',auth.authenticateUser,documentController.getDocuments);
router.get('/getDocument/:albumId',auth.authenticateUser,documentController.getDocument);
router.post('/inviteUser/:albumId',auth.authenticateUser,userController.inviteUser);
router.post('/shareUser/:albumId',auth.authenticateUser,userController.shareUser)
router.get('/getShare/:albumId',auth.authenticateUser,function(req,res){
  var albumId=req.params.albumId;
  var renderParams={albumId:albumId};
  res.render('user/share',renderParams);
})

router.get('/verifyRegister/:token',userController.verifyRegister);
router.get('/sharedAlbums/:user_id',auth.authenticateUser,albumController.sharedAlbums);
router.get('/sharedUser/:albumId',auth.authenticateUser,albumController.sharedUser);
router.put('/editAlbum/:albumId',auth.authenticateUser,albumController.editAlbum);
router.delete('/deleteDocument/:docId',auth.authenticateUser,documentController.deleteDocument);
router.delete('/deleteAlbum/:albumId',auth.authenticateUser,albumController.deleteAlbum);
router.put('/updateUserInfo',auth.authenticateUser,userController.updateUserInfo);
router.get('/user',auth.authenticateUser,commonService.getUser);
router.get('/updateUserInfo',auth.authenticateUser,function(req,res){
   res.render('user/updateUser')

})
router.get('/sharedToUser/:userId',auth.authenticateUser,albumController.sharedToUser);
router.get('/sentInvitations/:userId',auth.authenticateUser,albumController.sentInvitations)
module.exports = router;  