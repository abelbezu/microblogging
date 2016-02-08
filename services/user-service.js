var User = require('../models/user');
var Tweet = require('../models/tweet');
var tweetService = require('../services/tweet-service');
var mongoose = require('mongoose');

//Registers a new user in the database. 
//Takes an object with fields username and password.
//Executes the callback funciton with the new created user object
exports.addUser = function(user, next){

	var user = new User({
		username: user.username,
		password: user.password
	});

	user.save(function(err, saved_user){
		if(err){
			return next(err, null);
		}
		else{
			next(null, saved_user);
		}

	});

}; 


//Checks if any record in the database matches the given credentials
//If there is a positive match, executes the callback with affirmative message the user object
//If there is no matching record, executes the callback with message.
exports.authenticate = function(credentials, next){
	User.findOne({username : credentials.username, password: credentials.password}, function(err, results) {
        if(err) {
            next(err, null);
            return;
        } else if(results) {
		   next(null, {success: true}, results);
           return;


        } else {
            next(null, {success: false});
            return;
        }
    });
};


//registers a new tweet for the user. 
//Takes in a user a tweet and if succeeded executes the callback with the 
//update user object.
exports.tweet = function(creator, tweet_body, next){

	var user = User.findOne({username: creator.username}, function(findOne_err, found_user){//revise username/user id here
	if(findOne_err){
		next(findOne_err, null);
		return;
	};
	var tweet = new Tweet({
		tweet: tweet_body,
		_creator: mongoose.Types.ObjectId(found_user._id)
	});
   
  	tweet.save(function (error_saving_tweet, saved_tweet)
    {

      if(error_saving_tweet){
      	
        next(error_saving_tweet, null);
        return;
      }
      
      found_user.tweets.push(saved_tweet);
      found_user.save(function(error_updating_user, saved_user){
	  if(error_updating_user){
			next(error_updating_user, null);
			return;
			}
			next(null, saved_user);

			});
		     return;
	  });


});
};


// Registers a retweet for the given user.
//Takes in a user a tweet_id and if succeeded executes the callback with the 
//update user object.
exports.retweet = function(retweeter, tweet_id, next){

	var user = User.findOne({username: retweeter.username}, function(findOne_err, found_user){//revise username/user id here
	if(findOne_err){
		next(findOne_err, null);
		return;
	};

	var tweet = Tweet.findOne({_id: tweet_id}, function(err_fetching_tweet, found_tweet){
		if(err_fetching_tweet){
			next(err_fetching_tweet, null);
        	return;
		}
		found_user.retweets.push(found_tweet);
		found_user.save(function(error_updating_user, saved_user){
	  	if(error_updating_user){
			next(error_updating_user, null);
			return;
			}
			next(null, saved_user);

			});
		     return;
	  });

	});

};

exports.fetchUser = function(username, next){
	User.findOne({username: username}, function(err, found_user){
		if(err)
		{
			next(err, null);
			return;
		}
		
		next(null, found_user);
     		
		});
};

//Fetches users to follow for the specified user. Makes sure, if the given user is already 
//following a user that user is not going to be fetched.
//If succeeded, executes the callback with the updated user object.
exports.usersToFollowFor = function(user, next){
	User.findOne({username: user.username}, function(err, user){
		if(err)
		{
			next(err, null);
			return;
		}
		var _exceptions = []
		user.followees.forEach(function(followee){
			_exceptions.push(mongoose.Types.ObjectId(followee));
		});
		_exceptions.push(mongoose.Types.ObjectId(user._id)); 

		User.find({_id: {$not: {$in: _exceptions} }}, function(err, found_users){

			if(err)
			{
				next(err, null);
				return;
			}
			
			next(null, found_users);
	     		
		});



	});



};
//Checks if a user owns a tweet or had already retweeted the tweet.
// Returns true if the user owns or retweeted the tweet
// Returns False otherwise.
exports.hasRetweeted = function(retweeter, tweet){
	var return_val = false;
	if(retweeter._id == tweet._creator._id){
		return_val =  true;
		return true;
	}
	else{
		
		retweeter.retweets.forEach(function(tweet_id){
			if(tweet_id == tweet._id){
				return_val =  true;
				return true;
			}
	
		});
	}
	return return_val;


};

//
exports.fetchTweets = function(user, next){
	User.findOne({username: user.username}, function(err, found_user){
		if(err)
		{
			next(err, null);
			return;
		}
		
		
		found_user.populate('followees', function(err, user_with_followees){
			if (err){ 
				next(err, null);
				return;
			}

			var _wanted_tweets = [];
			user_with_followees.tweets.forEach(function(tweet_id){
				_wanted_tweets.push(mongoose.Types.ObjectId(tweet_id));
			});
			user_with_followees.retweets.forEach(function(retweet_id){
				_wanted_tweets.push(mongoose.Types.ObjectId(retweet_id));
			});
			user_with_followees.followees.forEach(function(followee){
				followee.tweets.forEach(function(tweet_id){
				_wanted_tweets.push(mongoose.Types.ObjectId(tweet_id));
				});
				followee.retweets.forEach(function(retweet_id){
					_wanted_tweets.push(mongoose.Types.ObjectId(retweet_id));
				});
			});
			Tweet.find({_id: {$in: _wanted_tweets}}, function(err_fetching_wanted_tweets, fetched_wanted_tweets){
				if(err_fetching_wanted_tweets){
					next(err_fetching_wanted_tweets, null);
					return;
				}
				var _tweets = [];
				// console.log('------------------');
				// console.log(fetched_wanted_tweets);
				// next(null, fetched_wanted_tweets);
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
				})(fetched_wanted_tweets, '_creator', 0, function(){

					next(null, _tweets);
				});


			});
			
		});



	});


};



exports.follow = function(follower, followee, next){
	User.findOne({username: follower.username}, function(follower_err, follower){
		if(follower_err)
		{
			next(follower_err, null);
			return;
		}
		User.findOne({username: followee.username}, function(followee_err, followee){
			if(followee_err){
				next(followee_err, null);
				return;
			}
			console.log("======================================");
			console.log(followee);
			follower.followees.push(followee);
			
			follower.save(function(saving_follower_err, follower){
				if(saving_follower_err)
				{
					next(err, null);
					return;
				}

				followee.followers.push(follower);
				followee.save(function(saving_followee_err, followee){
					if(saving_follower_err)
					{
						next(err, null);
						return;
					}
					next(null, followee);
				});
			});
		});


	});

};






