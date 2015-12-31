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
                         form: {url: TEST_FEED}, },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    setTimeout(callback, 1000);
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
                assert(body.posts.length > 0);
                callback();
            });
        },

        // log feed read...

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