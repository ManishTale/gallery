var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var docsSchema = new Schema({
    docName: {     type:String,
                required:"name is required",
                 },
    albumId: {   type: Schema.Types.ObjectId,
                 ref: 'Album'},
                            
    path: { type:String, required:true},
    

});

module.exports = mongoose.model('Doc', docsSchema);

