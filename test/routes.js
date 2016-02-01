var assert = require('assert');
var async = require('async');
var request = require('request');
request.defaults({jar: true});

var TEST_FEED = 'http://rss.cnn.com/rss/cnn_topstories.rss';

module.exports = function(app, callbackIn){

    var rootUrl = app.config.rootUrl;
    var email = 'foo_' + Date.now() + '@email.com';
    var password = 'Asdfasdf';
    var user;
    var feed;
    var posts;
    var userFeeds;
    
    var cookieJar = request.jar();

    async.series([

        // create user
        function(callback){

            request.post({uri: rootUrl + '/user',
                          form: {email: email, password: password},
                          jar: cookieJar
                      },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(body.user.email === email);
                    user = body.user;
                    callback();
                }
            });
        },

        // login user
        function(callback){
            request.post({uri: rootUrl + '/user/login',
                          form: {email: email, password: password},
                          jar: cookieJar },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    callback();
                }
            });
        },

        // confirm user is logged in
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(body.user.id === user.id);
                    callback();
                }
            });
        },

        // add feed
        function(callback){

            request.post({uri: rootUrl + '/feed',
                         jar: cookieJar,
                         form: {url: TEST_FEED}},
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    setTimeout(callback, 3000);
                }
            });
        },

        // get posts with page number
        function(callback){
            request.get({uri: rootUrl + '/post/user', jar: cookieJar },
                        function(err, httpResponse, body){
                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                posts = body.posts;
                assert(body.posts.length > 0);
                callback();
            });
        },

        // add posts to user log
        function(callback){
            request.post({  uri: rootUrl + '/log',
                            form: {posts: [posts[0]['id'], posts[1]['id']]},
                            jar: cookieJar  },
                        function(err, httpResponse, body){

                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                callback();
            });
        },

        // confirm log records added
        function(callback){

            request.get({  uri: rootUrl + '/log',
                           jar: cookieJar  },
                        function(err, httpResponse, body){
                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                assert(body.logs.length === 2);
                assert(body.logs[0] === posts[0]['id'] ||
                       body.logs[1] === posts[0]['id']);
                callback();
            });
        },
        // vote on post
        function(callback){
            request.post({  uri: rootUrl + '/post/vote',
                            form: {postId: posts[0]['id'], upvote: true},
                            jar: cookieJar  },
                        function(err, httpResponse, body){

                if( err ){ return callback(err); }
                // confirm vote counted
                app.models.post.get(posts[0]['id'], function(err, post){
                    if( err ){ return callback(err); }
                    assert((post.ranking > 0),
                           'Post ranking should be greater than zero.');
                    callback();
                });
            });
        },

        // get feeds
        function(callback){
            request.get({uri: rootUrl + '/user/feeds', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                assert(body.feeds.length > 0);
                userFeeds = body.feeds;
                callback();
            });
        },

        // add user tag
        function(callback){
            request.post({  uri: rootUrl + '/user/tag',
                            jar: cookieJar,
                            form: {tag: 'TEST_TAG'} },
                        function(err, httpResponse, body){
                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                callback();
            });
        },

        // add feed to tag
        function(callback){
            request.post({  uri: rootUrl + '/user/add-feed-to-tag',
                            jar: cookieJar,
                            form: {tag: 'TEST_TAG', feedId: userFeeds[0]}   },
                        function(err, httpResponse, body){
                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                callback();
            });
        },

        // confirm feed is added to tag
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(body.user.tags['TEST_TAG'][0] === userFeeds[0]);
                    callback();
                }
            });
        },

        // remove user tag
        function(callback){
            request.post({  uri: rootUrl + '/user/delete-tag',
                            jar: cookieJar,
                            form: {tag: 'TEST_TAG'} },
                        function(err, httpResponse, body){
                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                callback();
            });
        },

        // confirm user tag remove
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(typeof(body.user.tags['TEST_TAG']) === 'undefined');
                    callback();
                }
            });
        },

        // remove feed
        function(callback){
            request.post({  uri: rootUrl + '/user/remove-feed/' + userFeeds[0],
                            jar: cookieJar  },
                         function(err, httpResponse, body){

                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                callback();
            });
        },

        function(callback){
            request.get({uri: rootUrl + '/user/feeds', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'success');
                assert(body.feeds.length === 0);
                callback();
            });
        },

        // logout user
        function(callback){
            request.post({uri: rootUrl + '/user/logout',
                          jar: cookieJar },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    callback();
                }
            });
        },
        // confirm user is logged out
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ return callback(err); }
                body = JSON.parse(body);
                assert(body.status === 'failure');
                callback();
            });
        }
    ], callbackIn);
}