var assert = require('assert');
var async = require('async');
var feed = require("feed-read");

var TEST_FEED = 'https://www.reddit.com/.rss';
var TEST_FEED_02 = 'http://www.nytimes.com/services/xml/rss/nyt/US.xml';
var BAD_FEED = 'http://example.org/';

module.exports = function(app, callbackIn){

    var feedModel = app.models.feed;
    var postModel = app.models.post;
    var feed;
    var feed2;

    async.series([
        // create
        function(callback){
            feedModel.createIfNew({url: TEST_FEED}, function(err, resp){
                if( err ){
                    callback(err); 
                } else {
                    assert(resp.status === 'success');
                    feed = resp.feed;
                    app.testData.feed = feed;
                    callback();                    
                }
            });
        },
        // activate
        function(callback){
            feedModel.activate(feed.id, callback);
        },
        // create
        function(callback){
            feedModel.createIfNew({url: TEST_FEED_02}, function(err, resp){
                if( err ){
                    callback(err); 
                } else {
                    assert(resp.status === 'success');
                    feed2 = resp.feed;
                    callback();                    
                }
            });
        },
        // activate
        function(callback){
            feedModel.activate(feed2.id, callback);
        },
        // create
        function(callback){
            feedModel.createIfNew({url: BAD_FEED}, function(err, resp){
                if( err ){
                    callback(err); 
                } else {
                    assert(resp.status === 'failure');
                    callback();                    
                }
            });
        },
        // wait
        function(callback){
            setTimeout(callback, app.settings.feedMonitorInterval + 1000);
        },
        function(callback){
            postModel.getFromFeeds({feedIds: [feed.id, feed2.id], unlimit: true},
                                   function(err, posts){
                if( err ){
                    callback(err);
                } else {
                    var hasFeed1post = false;
                    var hasfeed2post = false;
                    posts.forEach(function(post){
                        if( post.feedId === feed.id ){
                            hasFeed1post = true;
                        } else if( post.feedId === feed2.id ){
                            hasfeed2post = true;
                        }
                    });
                    assert(hasFeed1post && hasfeed2post);
                    callback();
                }
            });
        },
        // turn off feeds
        feedModel.turnOffFeeds
    ], callbackIn);

}