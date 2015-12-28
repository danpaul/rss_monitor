/**
    Fields:
        - url
        - active
        - lastUpdate
*/
var _ = require('underscore');
var BaseModel = require('../lib/rethink_base_model');
var debug = require('debug')('rss_monitor');

var rssReadFeed = require('../lib/rss_read_feed');

module.exports = function(app){

    // var parent;
    var model = new BaseModel(this, app, __filename);

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
                    model.readFeed(feed);
                    model.setInterval(feed);
                    callbackIn();
                }
            });
        });
    }

    model.turnOnFeeds = function(callback){
        this.filter({row: 'active', value: true}, function(err, result){

        });
    }

    model.clearInterval = function(id){
        if( intervals[id] ){
            clearInterval(intervals[id]);
            delete intervals[id];
        }
    }

    /**
        Required:
            feedObject.url
        Passes back new or existing object
    */
    model.createIfNew = function(feedObject, callback){
        var self = this;
        feedObject.url = this._normalizeUrl(feedObject.url);
        this.filter({row: 'url', value: feedObject.url}, function(err, result){
            if( err ){
                callback(err);
                return;
            }
            if( result.length > 0 ){
                callback(null, result[0]);
            } else {
                self.create(feedObject, callback);
            }
        });
    };

    model.readFeed = function(feed){
        debug('reading feed', feed.id)
        rssReadFeed({url: feed.url}, function(err, feedData){
            if( err ){
                console.log(err);
                return;
            }
            feedData.data.feedId = feed.id;
            models.post.save(feedData.data, function(err){
                if( err ){ debug('Error saving post', err); }
            });
        });
    }


    model.setInterval = function(feed){
        var self = this;
        intervals[feed.id] = setInterval(function(){
            self.readFeed(feed);
        }, feedMonitorInterval)
    }

    model.turnOffFeeds = function(callback){
        var self = this;
        _.each(intervals, function(v, k){
            self.clearInterval(k);
        });
        callback();
    }

    model._normalizeUrl = function(url){
        var cleanUrl = url.trim();
        if(cleanUrl.substr(-1) === '/') {
            return cleanUrl.substr(0, cleanUrl.length - 1);
        }
        return cleanUrl;
    }

    return model;
}