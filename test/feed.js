var assert = require('assert');
var async = require('async');

var TEST_FEED = 'https://www.reddit.com/.rss';
// var TEST_FEED = 'http://www.nytimes.com/services/xml/rss/nyt/US.xml';

module.exports = function(app, callbackIn){

    var feedModel = app.models.feed;
    var feed;

    async.series([
        // create
        function(callback){
            feedModel.create({url: TEST_FEED}, function(err, feedIn){
                if( err ){
                    callback(err); 
                } else {
                    feed = feedIn;
                    callback();                    
                }
            });
        },
        // activate
        function(callback){
            feedModel.activate(feed.id, callback);
        },
        // 
    ], callbackIn);

}