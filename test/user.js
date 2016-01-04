var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var config = require('../config');

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

    var checkLogs = function(numberOfLogs, callback){
        models.userPostLog.getLog({userId: user.id}, function(err, logs){
                if( err ){
                    callback(err);
                    return;
                }
                assert(logs.length === numberOfLogs);
                if( logs.length === 1 ){
                    assert(logs[0] === userPosts[0]['id']);
                }
                callback();
            });
    }

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
        // add tags
        function(callback){
            // tag too short
            userModel.addTag({tagName: 'a', userId: user.id}, function(err, resp){
                if( err ){ return callback(err); }
                assert(resp.status === 'failure');
                // tag too long
                userModel.addTag({  tagName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                                    userId: user.userId},
                                 function(err, resp){
                    if( err ){ return callback(err); }
                    assert(resp.status === 'failure');
                    userModel.addTag({tagName: 'TEST_TAG', userId: user.id},
                                     function(err, resp){
                        if( err ){ return callback(err); }
                        assert(resp.status === 'success');
                        callback();
                    });
                });
            })
        },
        // confirm updated
        function(callback){
            userModel.get(user.id, function(err, user){
                if( err ){ return callback(err); }
                assert(_.isArray(user.tags['TEST_TAG']));
                callback();
            })
        },
        // add feed to tag
        function(callback){
            userModel.addFeedToTag({    userId: user.id,
                                        tagName: 'TEST_TAG',
                                        feedId: testData.feed.id}, function(err, resp){
                assert(resp.status === 'success');
                callback();
            });
        },
        // confirm feed added to tag
        function(callback){
            userModel.getPublicUser(user.id, function(err, resp){
                if( err ){ return callback(err); }
                assert(resp.user.tags['TEST_TAG'][0] === testData.feed.id);
                callback();
            });
        },

        // get posts by tags
        function(callback){
            userModel.getPosts({userId: user.id, tags: ['TEST_TAG']},
                               function(err, posts){
                if( err ){ return callback(err); }
                assert(posts.length > 0);
                callback();
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
            checkLogs(1, callback);
        },
        
        // remove feed
        function(callback){
            models.user.removeFeed({userId: user.id, feedId: testData.feed.id},
                                   callback);
        },

        // confirm feed is removed and removed from tag
        function(callback){
            models.user.get(user.id, function(err, user){
                if( err ){ return callback(err); }
                assert(!_.contains(user.tags['TEST_TAG'], testData.feed.id));
                assert(!_.contains(user.feeds, testData.feed.id));
                callback();
            })
        },

        // test clear functionality only in development
        function(callback){
            if( !(config.environment === 'development') ){
                callback();
                return;
            }
            // clear everything before a minute ago
            models.userPostLog.cleanLogs({maxAge: 1000 * 60 },
                                         function(err){

                if( err ){
                    callback(err);
                    return;
                }
                checkLogs(1, function(err){
                    if( err ){
                        callback(err);
                        return;
                    }
                    // clear everything before now
                    models.userPostLog.cleanLogs({maxAge: 0 },
                                                 function(err){
                        if( err ){ callback(err);
                        } else { checkLogs(0, callback); }
                    });
                });
            });
        },
    ], callbackIn);
}