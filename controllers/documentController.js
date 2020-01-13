const commonService = require('../services/commonService');
var multer = require('multer');
var docModel = require('../models/docModel');
var fs = require('fs');




var storage = multer.diskStorage({
  destination: function (req, file, callback) {
               callback(null, './uploads');
  },
  filename: function (req, file, callback) {
               callback(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});


var upload = multer({ storage: storage }).single('myfile');




//addPhoto/video

exports.uploadDocument = function (req, res, next) {
  var user_id = req.session.user.id;
  req.body.user_id = user_id;
  var albumId = req.params.albumId;

  upload(req, res, function (err) {
    if (err) {
      commonService.sendResponse(res, 201, 'error', 'error uploading file', '')
    } else {


      let document = new docModel({
        docName: req.file.originalname,
        path: req.file.path,
        albumId: albumId
      });

      document.save().then(function (doc) {
        res.end("File is uploaded successfully!");

      })
    }
  });
}

//get documents
exports.getDocuments = function (req, res, next) {
  var user_id = req.session.user.id;
  var albumId = req.params.albumId;
  var renderParams = {
              user_id: user_id,
               albumId: albumId
   }
  docModel.find({ albumId: albumId }).then(function (documents) {
    var albums = {};
    for (var i = 0; i < documents.length; i++) {

      albums[documents[i].path] = documents[i]._id;
    }
    renderParams.paths = albums;

    res.render('user/documents', renderParams);


        }).catch(function (error) {
      commonService.sendResponse(res, 201, 'error', 'some error', '')
  })
}



//to get a first document
exports.getDocument = function (req, res, next) {

  var albumId = req.params.albumId;

  docModel.findOne({ albumId: albumId }).then(function (document) {
    var temp = document.path;

    var pathName = temp.replace(/\\/g, '/');
    var pathName = 'http://localhost:3000/' + pathName;
    res.redirect(pathName);

  }).catch(function (error) {

    return res.redirect("https://placehold.it/150x80?text=IMAGE");
  })



}
//to delete document
exports.deleteDocument = function (req, res, next) {

  var docId = req.params.docId;

  docModel.findOne({ _id: docId }).then(function (doc) {
    var path = doc.path;
    path = './' + path;

    fs.unlink(path, function (err) {
      if (err && err.code == 'ENOENT') {

        commonService.sendResponse(res, 201, 'error', 'file doesnt exist', '')
      } else if (err) {

        commonService.sendResponse(res, 201, 'error', 'some error', '')
      } else {

        docModel.remove({ _id: docId }).then(function (done) {
          commonService.sendResponse(res, 201, 'sucesss', 'sucesss', '')
        })
      }
    });
  })
}
