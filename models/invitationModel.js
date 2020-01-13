var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var invitationSchema = new Schema({
   
    email: {    type :String,
                match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
                required:true 
                            },
    albumId: {   type: Schema.Types.ObjectId,
                                ref: 'Album'},
    token :  String,

    active : Boolean
   
});

module.exports = mongoose.model('Invitation', invitationSchema);
