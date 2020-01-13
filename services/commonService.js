



exports.sendResponse = function (res, statusCode, status, message, data = '') {
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({
        "status": status,
        "message": message,
        "data": data
    }));
    res.end();
}

exports.getUser = function (req,res,next) {
      
    var user=req.session.user;
    var renderParams={
          email:user.email,
          userName:user.userName
    }     
    res.render('user/userProfile',renderParams);

}