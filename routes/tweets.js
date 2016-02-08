var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');


var userService = require('../services/user-service');
var tweetService = require('../services/tweet-service');

/*
  Require authentication on ALL access to /tweets/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!(req.session.currentUser)) {
     
     res.redirect('/users/login');
  } 
  else {
    next();
  }
};

/*
  Require ownership whenever accessing a particular tweet
  This means that the client accessing the resource must be logged in
  as the user that originally created the tweet. Clients who are not owners 
  of this particular resource will receive a 404.

  Why 404? We don't want to distinguish between tweets that don't exist at all
  and tweets that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireOwnership = function(req, res, next) {
  // if (!(req.currentUser.username === req.tweet.creator)) {
  //   utils.sendErrResponse(res, 404, 'Resource not found.');
  // } else {
  //   next();
  // }
};

/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function(req, res, next) {
  if (!req.body.tweet) {
    
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Grab a tweet from the store whenever one is referenced with an ID in the
  request path (any routes defined with :tweet as a paramter).
*/
router.param('tweet', function(req, res, next, tweetId) {
  User.gettweet(req.currentUser.username, tweetId, function(err, tweet) {
    if (tweet) {
      req.tweet = tweet;
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});

// Register the middleware handlers above.
// router.delete('/:tweet', requireOwnership);
router.post('/', requireContent);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that tweet
  3. Requests are well-formed
*/

/*
  GET /tweets
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's tweets
    - content: on success, an object with a single field 'tweets', which contains a list of the
    user's tweets
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  userService.fetchTweets(req.session.currentUser, function(error, tweets) {

      res.locals.loggedIn = req.session.loggedIn;
      res.locals.username = req.session.currentUser.username;
      res.render('partials/tweets/tweets', {title: "Fritter", tweets: tweets});
    
  });
});


/*
  POST /tweets
  Request body:
    - content: the content of the tweet
  Response:
    - success: true if the server succeeded in recording the user's tweet
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  userService.tweet(req.session.currentUser, req.body.tweet, function(err, tweet) {
    if (err) {
      console.log('Error saving tweet');
      console.log(err);
    } else {
      res.locals.loggedIn = req.session.loggedIn;
      res.locals.username = req.session.username;
      res.redirect('/users/home');
    }
  });
});



router.post('/retweet', function(req, res) {
  userService.retweet(req.session.currentUser, req.body.tweet_id, function(err, updated_user) {
    if (err) {
      console.log('Error saving tweet');
      console.log(err);
    } else {
      req.session.currentUser = updated_user;
      res.redirect('/users/home');
    }
  });
});


/*
  DELETE /tweets/:tweet
  Request parameters:
    - identifier, holds a unique identifier of the tweet (<username>_<tweet_id>)
  Response:
    - success: true if the server succeeded in deleting the user's tweet
    - err: on failure, an error message
*/

router.post('/delete', function(req, res) {
  tweetService.deleteTweet(req.body.tweet_id, function(err, result){
    if(err){
      console.log("error deleting tweet. ");
      console.log(err);
      return;
    }
    res.redirect('/users/home');


  });
});




module.exports = router;
