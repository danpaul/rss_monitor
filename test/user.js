var assert = require('assert');
var async = require('async');

// generic base model method test
var MODEL_NAME = 'example';

module.exports = function(app, callbackIn){
    var username = 'foo_' + Date.now();
    var email = 'foo_' + Date.now() + '@email.com';
    var user = null;
    var userModel = app.models.user;
    var userPosts;
    var testData = app.testData;
    var models = app.models;

    async.series([
        // create
        function(callback){
            userModel.createNew({email: email,
                                 username: username,
                                 password: 'Asdfasdf'}, function(err, response){
                if( err ){ callback(err); }
                else{
                    assert(response.status === 'success');
                    user = response.user;
                    callback(); }
            });
        },
        // get
        function(callback){
            userModel.get(user.id, function(err, newUser){
                if( err ){ callback(err); }
                else{
                    assert(newUser.id === user.id);
                    callback();
                }
            });
        },
        // add feed
        function(callback){
            userModel.addFeed({userId: user.id, feedId: testData.feed.id},
                              callback);
        },
        function(callback){
            userModel.get(user.id, function(err, updatedUser){
                if( err ){
                    callback(err);
                } else {
                    assert(updatedUser.feeds[0] === testData.feed.id);
                    callback();
                }
            });
        },
        // get user posts
        function(callback){
            userModel.getPosts({userId: user.id}, function(err, posts){
                if( err ){ callback(err); }
                else{
                    userPosts = posts;
                    assert(posts.length > 0);
                    callback();
                }
            });
        },
        // add to post log
        function(callback){
            models.userPostLog.add({userId: user.id, postId: userPosts[0]['id']},
                                   callback);
        },
        // get log
        function(callback){
            models.userPostLog.getLog({userId: user.id}, function(err, logs){
                if( err ){
                    callback(err);
                    return;
                }
                assert(logs.length === 1);
                assert(logs[0]['postId'] === userPosts[0]['id']);
                callback();
            });
        }        

    ], callbackIn);
}