var mongoose = require('mongoose')
  , Schema = mongoose.Schema


var userSchema = mongoose.Schema({
	  username: {
	    type:String,
	    required: true,
	    unique: true
	  },

	  password: {
	    type: String,
	    required: true
	  },

	  tweets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tweet'}],
	  retweets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tweet'}],

	  followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	  followees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]

});




module.exports = mongoose.model('User', userSchema);









