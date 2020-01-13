var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    userName: {     type:String,
                required:"name is required",
                maxlength:15,
                minlength:4  },
    email: {    type :String,
                match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
                required:true 
                            },
    password: { type:String, required:true, minlength:4},
    accessToken:  String,
   
});

module.exports = mongoose.model('User', userSchema);

