var mongoose = require('mongoose')
  , Schema = mongoose.Schema


var tweetSchema = mongoose.Schema({
      
      _creator : { type: Schema.Types.ObjectId, ref: 'User' },
        
    tweet: {
      type: String,
      required: true
    }

});

tweetSchema.pre('remove', function(next){
    this.model('User').update(
        '*',
        {$pull: {tweets: this._id, retweets: this._id}}, 
        {multi: true},
        next
    );
});

module.exports = mongoose.model('Tweet', tweetSchema);
























// // var mongoose = require("mongoose");
// // var tweetSchema = mongoose.Schema({
  
// //   tweet: {
// //   	type: String,
// //   	required: true
// //   },
  
// //   user: {
// //   	type: Number,
// //   	required: true
// //   },

// //   retweeted_by: [{
// //   	username: String,
// //   }
// //   ],


// // });


// // module.exports = mongoose.model('Tweet', tweetSchema);

// var mongoose = require('mongoose')
//   , Schema = mongoose.Schema

//   mongoose.connect('mongodb://localhost/test');
//   var db = mongoose.connection;

//   db.on('error', console.error.bind(console, 'connection error:'));
//   db.once('open', function (callback) {
//       console.log("database connected");
//       main();
//   });


// var main = function(){ 
// var personSchema = Schema({
//   _id     : Number,
//   name    : String,
//   age     : Number,
//   stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
// });

// var storySchema = Schema({
//   _creator : { type: Number, ref: 'Person' },
//   title    : String,
//   fans     : [{ type: Number, ref: 'Person' }]
// });

// var Story  = mongoose.model('Story', storySchema);
// var Person = mongoose.model('Person', personSchema);




// var aaron = Person.findOne({_id: 1}, function(err, res){
//   if(err){
//     console.log(err);
//     return;
//   }

//   // var story1 = new Story({
//   //   title: "Once upon a timex.",
//   //   _creator: res._id    // assign the _id from the person
//   // });
  
//   // story1.save(function (error, story) {
//   //   {
//   //     if(error){
//   //       console.log('error');
//   //       console.log(error);
//   //       return;
//   //     }
//   //     // console.log("story id: ");
//   //     // console.log(story._id);
//   //     res.stories.push(story);
//   //     // console.log(res);
//   //     res.save(function(err, result){
//   //      if(err){
//   //       console.log('something went wrong');
//   //       console.log(res._id);
//   //      }
//   //      else{
//   //         console.log(result);
//   //      }
       
//   //     });
//   //    return;
//   // }});

//   res.populate('stories', function (err, person) {
//   if (err){ 
//     console.log(err);
//     return;
//   }
//     console.log(person);
//   });
 
// });

// //console.log(Object.getOwnPropertyNames(aaron));

// // aaron.save(function (err) {
// //   console.log('saving');
// //   if (err) {
// //     console.log('user error');
// //     console.log(err)
// //     return; //handleError(err);
// //   }
//   // var story1 = new Story({
//   //   title: "Once upon a timex.",
//   //   _creator: aaron._id    // assign the _id from the person
//   // });
  
//   // story1.save(function (err) {
//   //   {
//   //   console.log('story error');
//   //   console.log(err)
//   //   return; //handleError(err);
//   // }});
// // // });
// // // });
// // // };
// // console.log(aaron.stories);
// // aaron.stories.push(story1);
// // aaron.save();
// // Story
// // .findOne({ title: 'Once upon a timex.' })
// // .populate('_creator')
// // .exec(function (err, story) {
// //   if (err) return handleError(err);
// //   console.log('The creator is %s', story._creator.name);
// //   // prints "The creator is Aaron"
// // });
// // }
// // Person.findOne({name: 'Aaron'}).populate('stories').exec(function(err, person){
// //   if(err)
// //   {
// //     console.log('populate err');
// //     console.log(err);
// //     return;
// //   }
// //   console.log(person.stories);

// // });
// // }
// // Story.findOne({ title: 'Once upon a timex.' }, function(error, story) {
// //   if (error) {
// //     return; //handleError(error);
// //   }
// //   story._creator = aaron;
// //   console.log(story._creator.name); // prints "Aaron"
// // });
// // };

// }













