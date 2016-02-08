// this file contains all the tests for both users and tweets. I included both of them
// in one file because one open connection and the same set of test data
// can be then used to test them both tweets and users, with out an issue of race condition.
// Also, note that we are actually testing userService and tweetService. This moves the 
// Functionality away from the schema files and provides flexibility. 
// The schemas don't contain any special methods. Therefore they are not tested here.

var Tweet = require('../models/tweet');
var User = require('../models/user');
var assert = require("assert");

var mongoose = require("mongoose");
var userService = require('../services/user-service');
var tweetService = require('../services/tweet-service');

mongoose.connect('mongodb://localhost/fritter_test');
var db = mongoose.connection;

describe('Users and tweets', function(){  

	before(function(done){    

		db.on('error', console.error.bind(console, 'connection error:'));

		db.once('open', function () {
				console.log("database connected");
				User.remove({}, function(){
					Tweet.remove({}, function(){

			    	//populate db with test data
			    	var test_user_1 = new User({
			    		username: "test_user_1",
			    		password: "123456"
			    	});

			    	test_user_1.save(function(err, saved_user){
			    		if(err){
			    			console.log("Error saving user");
			    			console.log(err);
			    			return;
			    		}
			    		var test_tweet_1 = Tweet({
			    			_creator: mongoose.Types.ObjectId(saved_user._id),
			    			tweet: "test tweet 1"
			    		});

			    		test_tweet_1.save(function(){
			    			
			    			var test_tweet_2 = Tweet({
			    				_creator: mongoose.Types.ObjectId(saved_user._id),
			    				tweet: "test tweet 2"
			    			});

			    			test_tweet_2.save(function(){

			    				var test_tweet_3 = Tweet({
			    					_creator: mongoose.Types.ObjectId(saved_user._id),
			    					tweet: "test tweet 3"
			    				});

			    				test_tweet_3.save(function(){

			    					done();
			    				});

			    			});

			    		});

			    	});
			    });
			   });
		});
	});    

	describe('userService', function() {
		it('addUser() adds users properly', function(done) {
			userService.addUser({
				username: "test_user_2",
				password: "123456"
			}, 


			function(err, added_user){
				if(err){
					console.log(err);
				}
				else{
					assert.equal('test_user_2', added_user.username);

				}
				done();

			});

		});
		it('authenticate() lets registered users pass', function(done) {
			userService.authenticate({
				username: "test_user_2",
				password: "123456"
			}, 


			function(err, msg, verified_user){
				if(err){
					console.log(err);
				}
				else{
					assert(msg.success);
					assert.equal("test_user_2", verified_user.username);

				}
				done();

			});

		});
		it('authenticate() denies access to wrong username and password', function(done) {
			userService.authenticate({
				username: "test_user_2",
				password: "fake_password"
			}, 


			function(err, msg, verified_user){
				if(err){
					console.log(err);
				}
				else{
					assert(!msg.success);


				}
				done();

			});

		});

		it('tweet() adds tweet to the user', function(done) {
			userService.tweet({
				username: "test_user_1"
			}, 

			"this is a test tweet",

			function(err, saved_user){
				if(err){
					console.log(err);
				}
				else{
					assert.equal(1, saved_user.tweets.length);

				}
				done();

			});

		});

		it('retweet() adds tweet to the user', function(done) {
			Tweet.find('*', function(err, tweets){
				if(err){
					console.log(err);
				}
				else{

					userService.retweet({
						username: "test_user_1"
					}, 

					tweets[0],

					function(err, saved_user){
						if(err){
							console.log(err);
						}
						else{
							assert.equal(1, saved_user.retweets.length);

						}
						done();

					});



				}
			});

		});

		it('usersToFollowFor() fetches users', function(done) {
			userService.fetchUser("test_user_1", function(err, fetched_user){
				if(err){
					console.log(err);
					return;
				}
				userService.usersToFollowFor(fetched_user, function(error_fetching_users, users){
					if(error_fetching_users){
						console.log(error_fetching_users);
						return;
					}
					else{
						console.log(users);
						assert.equal("test_user_2", users[0].username);
					}
					done();
				});
			});
			

		});


	});



	describe('tweetService', function() {
		it('fetchAllTweets() fetches all tweets', function(done) {
			tweetService.fetchAllTweets(function(error_fetching_tweets, tweets){
				if(error_fetching_tweets){
					console.log(error_fetching_tweets);
				}
				else{
					assert.equal('test tweet 1', tweets[0].tweet);
					assert.equal('test tweet 2',tweets[1].tweet);
					assert.equal('test tweet 3',tweets[2].tweet);
				}
				done();

			});

		});

		it('removes tweet', function(done) {
			tweetService.fetchAllTweets(function(error_fetching_tweets, fetched_tweets){
				if(error_fetching_tweets){
					console.log(error_fetching_tweets);
				}
				else{
	  			//first check that all are there
	  			assert.equal('test tweet 1', fetched_tweets[0].tweet);
	  			assert.equal('test tweet 2', fetched_tweets[1].tweet);
	  			assert.equal('test tweet 3', fetched_tweets[2].tweet);
	  			//then remove one of them
	  			tweetService.deleteTweet(fetched_tweets[1]._id, function(err){
	  				if(err){
	  					console.log(err);
	  				}
	  				else{
	  					tweetService.fetchAllTweets(function(error_fetching_tweets, after_removed_tweets){
	  						if(error_fetching_tweets){
	  							console.log(error_fetching_tweets);
	  						}
	  						else{
	  							assert.equal('test tweet 1', after_removed_tweets[0].tweet);
	  							// assert.equal('test tweet 2',tweets[1].tweet);
	  							assert.equal(undefined, after_removed_tweets[3]);
	  						}
	  						done();

	  					});
	  				}
	  			});



	  		}
	  		
	  		});

		});

	});


	after(function(done){
		mongoose.connection.close(function(){
		        	 done();
		        });  
		// User.remove(function(err){
		//     Tweet.remove(function() {
		//         mongoose.connection.close(function(){
		//         	 done();
		//         });


		//     });        
		// });
	});

});

