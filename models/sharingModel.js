var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var sharingSchema=new Schema(
    {
          
      sharedUserId:{
                 type:Schema.Types.ObjectId,
                 ref:'User'     
      },
      albumId :{
        
        type:Schema.Types.ObjectId,
         ref:'Album'
                }
      


    }
);

module.exports=mongoose.model('Sharing',sharingSchema);
