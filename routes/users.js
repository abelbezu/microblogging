var express = require('express');
var utils = require('../utils/utils');
var router = express.Router();

var userService = require('../services/user-service');
var tweetService = require('../services/tweet-service');


var requireAuthentication = function(req, res, next) {
  if (!req.session.currentUser) {
    res.redirect('/users/login');
  } else {
    next();
  }
};

router.all('/', requireAuthentication);
router.get('/profile/:id', requireAuthentication);
router.get('/home', requireAuthentication);
router.get('/feed', requireAuthentication);

router.get('/login', function(req, res, next){
  if (req.session.loggedIn) {
    res.locals.loggedIn = req.session.loggedIn;
    res.locals.username = req.session.username;
    res.render('partials/tweets/tweets', {title: "Fritter"});
  }
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.username = req.session.username;
  res.render('partials/users/login', {error: false, title: 'Fritter - Sign In' });
});

router.get('/home', function(req, res, next){
  tweetService.fetchAllTweets(function(err, fetched_tweets){
   if(err){
    console.log('Error fetching users. ')
    console.log(err);
    return;
  }

  userService.usersToFollowFor(req.session.currentUser, function(err_fetching_users, fetched_users){
      if(err_fetching_users){
        console.log(err_fetching_users)
      }
      else{
        res.locals.loggedIn = req.session.loggedIn;
        res.locals.username = req.session.currentUser.username;
        var local_tweets = [];
        fetched_tweets.forEach(function(fetched_tweet){
      
        if(userService.hasRetweeted(req.session.currentUser, fetched_tweet)){
          
          local_tweets.push({tweet: fetched_tweet, retweetable: false});
        }
        else{
          local_tweets.push({tweet: fetched_tweet, retweetable: true});
        }
       });

        res.render('partials/users/home', {users_to_follow: fetched_users, follow_info: {followers: req.session.currentUser.followers.length, followees: req.session.currentUser.followees.length}, title: "Fritter", tweets: local_tweets, user: req.session.currentUser});
          }
    })




});
});

router.get('/feed', function(req, res, next){

  userService.fetchTweets(req.session.currentUser, function(err, fetched_tweets){
     if(err){

      console.log('Error fetching tweets. ');
      console.log(err);
      return;
    }
    userService.usersToFollowFor(req.session.currentUser, function(err_fetching_users, fetched_users){
      if(err_fetching_users){

        console.log(err_fetching_users);
      }
      else{
       
        res.locals.loggedIn = req.session.loggedIn;
        res.locals.username = req.session.currentUser.username;
        var local_tweets = [];

        fetched_tweets.forEach(function(fetched_tweet){
      
        if(userService.hasRetweeted(req.session.currentUser, fetched_tweet)){
          
          local_tweets.push({tweet: fetched_tweet, retweetable: false});
        }
        else{
          local_tweets.push({tweet: fetched_tweet, retweetable: true});
        }
        
        });

        res.render('partials/users/feed', {users_to_follow: fetched_users, follow_info: {followers: req.session.currentUser.followers.length, followees: req.session.currentUser.followees.length}, title: "Fritter", tweets: local_tweets, user: req.session.currentUser});
        
    }
    
  });

});
});







router.get('/register', function(req, res, next){
  res.locals.loggedIn = false;

  res.render('partials/users/register', {error: false, title: 'Fritter - Sign In' });

});

router.post('/login', function(req, res) {
  userService.authenticate(req.body, function(err, message, result){
    if(err){
      console.log("Something went wrong");
      utils.sendErrResponse(res, 403, 'Something went wrong');
    }
    else if(message.success){
      req.session.loggedIn = true;
      req.session.currentUser = result;
      res.redirect('/users/home');

    }
    else{
     res.locals.loggedIn = false;
     res.render('partials/users/login', {title: "Fritter", error: true});
   }
 });
});

router.post('/register', function(req, res) {
  userService.addUser(req.body, function(err, result){
    if(err){
      console.log(err);
      res.locals.loggedIn = false;
      res.render('partials/users/register', {title: "Fritter", error: true});
    }
    else{
      req.session.loggedIn = true;
      req.session.currentUser = result;
      res.redirect('/users/home');
    }
  });
});


router.post('/follow', function(req, res) {
  userService.follow(req.session.currentUser, {username: req.body.followee_name}, function(err, result){
    if(err){
      console.log(err);
      return;
    }
    else{
      res.redirect('/users/home');
    }

  });
});


/*
POST /users/logout
Request body: empty
Response:
- success: true if logout succeeded; false otherwise
- err: on error, an error message
*/
router.get('/logout', function(req, res) {
  if (req.session.currentUser) {

    req.session.destroy();
    res.locals.loggedIn = false;
    res.render('partials/users/login', {error: false, title: "Fritter"});
  } else {
    res.redirect('/users/register');
  }
});


module.exports = router;
