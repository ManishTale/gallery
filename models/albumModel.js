var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var albumSchema = new Schema({
   albumName: {     type:String,
                required:"name is required",
                maxlength:15,
                minlength:4,
                  },
    userId: {   type: Schema.Types.ObjectId,
                 ref: 'User'},
                            
   
    

});

module.exports = mongoose.model('Album', albumSchema);