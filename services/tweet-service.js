var User = require('../models/user');
var Tweet = require('../models/tweet');
var mongoose = require('mongoose');



// Fetches all the tweets in the database populates their _creator field and executse
// the call back with them.
exports.fetchAllTweets = function(next){
	Tweet.find('*', function(err, tweets){
		if(err){
			next(err, null);
			return;
		}
		else{
			var _tweets = [];
			//Look at this sick (sleek) iterator :)

			(function populate_list (list, field, i, callback){
				if(i == list.length){
					callback();
					return;
				}
				list[i].populate('_creator', function(err, populated_tweet){
					if(err){
						next(err, null);
						return;
					}
					_tweets.push(populated_tweet);
					populate_list(list, field, (i+1), callback)

				})
			})(tweets, '_creator', 0, function(){

				next(null, _tweets);
			});

			return;
		}
	});

};

//deletes the tweet with the specified tweet id.
exports.deleteTweet = function(tweet_id, next){
	Tweet.remove({_id: tweet_id}, function(err, result){
		if(err){
			
			next(err, null);
			return;
		}
		next(null, result);
	});
}

