/**
    Fields:
        - url
        - active
        - lastUpdate
*/

var BaseModel = require('../lib/rethink_base_model');
var debug = require('debug')('rss_monitor');

var rssReadFeed = require('../lib/rss_read_feed');

module.exports = function(app){

    model = new BaseModel(this, app, __filename);

    var models = app.models;

    // set model defaults
    model.defaults  = {url: '', active: false, lastUpdate: 0};

    // defines the rethink indexes
    model.indexes = ['url', 'active'];

    var feedMonitorInterval = app.settings.feedMonitorInterval;
    var intervals = {};

    model.activate = function(id, callbackIn){
        this.get(id, function(err, feed){
            if( err ){
                callbackIn(err);
                return;
            }
            model.update({id: id, active: true}, function(err){
                if( err ){
                    callbackIn(err);
                } else {
                    model.setInterval(feed);
                    callbackIn();
                }
            });
        });
    }

    model.clearInterval = function(id){
        if( intervals[id] ){
            clearInterval(intervals[id]);
            delete intervals[id];
        }
    }


    model.setInterval = function(feed){
        rssReadFeed({url: feed.url}, function(err, feedData){
            if( err ){
                console.log(err);
                return;
            }
            feedData.data.feedId = feed.id;
            models.post.save(feedData.data, function(err){
                if( err ){ debug('Error saving post', err); }
            });

// console.log(feed.id)
// // console.log(feedData.data.guid)
// var date = new Date(feedData.data.date);
// console.log(date.getTime())
// console.log(feedData.data.date);

        });
    }

    return model;
}