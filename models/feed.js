/**
    Fields:
        - url
        - active
        - lastUpdate
*/
var _ = require('underscore');
var async = require('async');
var loadRssLink = require('load-rss-link');

var BaseModel = require('../lib/rethink_base_model');
var debug = require('debug')('rss_monitor');
var errors = require('../lib/errors');
var feed = require('feed-read');
var rssReadFeed = require('../lib/rss_read_feed');
var validUrl = require('valid-url');

module.exports = function(app){

    // var parent;
    var model = new BaseModel(this, app, __filename);

    var models = app.models;

    // set model defaults
    model.defaults  = {url: '', active: false, lastUpdate: 0};

    // defines the rethink indexes
    model.indexes = ['url', 'active'];

    model.settings = {
        intervalbetweenFeeds: 1000
    }

    var feedMonitorInterval = app.settings.feedMonitorInterval;
    var intervals = {};

    model.init = function(){
        this.turnOnFeeds(function(err){ if( err ){ throw(err); } });
    }

    model.activate = function(id, callback){
        this.get(id, function(err, feed){
            if( err ){ return callback(err); }
            model.update({id: id, active: true}, function(err){
                if( err ){ return callback(err); }
                model.readFeed(feed);
                model.setInterval(feed);
                callback();
            });
        });
    }

    model.turnOnFeeds = function(callbackIn){
        var self = this;
        this.filter({row: 'active', value: true}, function(err, feeds){
            if( err ){ return callbackIn(err); }
            async.eachSeries(feeds, function(feed, callback){
                self.setInterval(feed);
                setTimeout(callback, self.settings.intervalbetweenFeeds)
            }, callbackIn);
        });
    }

    /**
        Required:
            feedObject.url
        Passes back new or existing object wrapppend in response object
    */
    model.createIfNew = function(feedObject, callback){
        var self = this;
        feedObject.url = this._normalizeUrl(feedObject.url);
        var invalidFeedError = { status: 'failure', message: 'URL is not valid' };
        this.filter({row: 'url', value: feedObject.url}, function(err, result){
            if( err ){ return callback(err); }
            if( result.length > 0 ){
                return callback(null, {status: 'success', feed: result[0]});
            }
            // validate URL
            if( !validUrl.isUri(feedObject.url) ){
                return(callback(null, invalidFeedError));
            }

            // test URL
            self.feedIsValid(feedObject.url, function(err, isValid){
                if( err ){ return callback(errors.server); }
                if( !isValid ){
                    loadRssLink({url: feedObject.url}, function(err, rssLink){
                        if( err ){ return callback(errors.server); }
                        if( rssLink === null ){
                            return callback(null, invalidFeedError);
                        }
                        feedObject.url = rssLink;
                        self.feedIsValid(feedObject.url, function(err, isValid){
                            if( !isValid ){
                                return callback(null, invalidFeedError);
                            }
                            self._create(feedObject, callback);
                        });
                    });
                } else {
                    self._create(feedObject, callback);
                }
            });
        });
    }

    model._create = function(feedObject, callback){
        var self = this;

        self.create(feedObject, function(err, newFeed){
            if( err ){ return callback(err); }
            self.updateMeta(newFeed.id, function(err){
                if( err ){ return callback(err); }
                callback(null, {status: 'success', feed: newFeed});
            });
        });
    }

    model.feedIsValid = function(url, callback){
        feed(url, function(err, posts){
            if(err){ return callback(null, false); }
            return callback(null, true)
        });
    }

    model.updateMeta = function(feedId, callback){
        var self = this;
        this.get(feedId, function(err, feedObj){
            if( err ){ return callback(err); }
            feed(feedObj.url, function(err, feedData){
                if( err ){ return callback(err); }
                if( feedData.length < 1 ){ return callback(); }
                var feedMeta = feedData[0]['feed'];
                if( !feedMeta || !feedMeta.name ){ return(callback); }
                feedObj.name = feedMeta.name;
                if( feedMeta.link ){ feedObj.link = feedMeta.link; }
                self.update(feedObj, callback);
            });
        });
    }

    model.readFeed = function(feed){
        debug('reading feed', feed.id)
        rssReadFeed({url: feed.url}, function(err, feedData){
            if( err ){
                console.log(err);
                return;
            }
            if( app.config.debug ){
// console.log(feedData.data);
                console.log('Saving ' + feedData.data.title + ' to ' + feed.name);
            }
            feedData.data.feedId = feed.id;
            models.post.save(feedData.data, feed, function(err){
                if( err ){ debug('Error saving post', err); }
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
        var self = this;
        this.clearInterval(feed.id);
        intervals[feed.id] = setInterval(function(){
            if( app.config.debug ){
                console.log('Reading feed: ', feed.name);
            }
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

    /**
        Required:
            options.url
    */
    model.addAndActivate = function(options, callback){
        var self = this;
        self.createIfNew(options, function(err, resp){
            if( err ){ return callback(err); }
            if( resp.status !== 'success' ){ return callback(null, resp); }
            self.activate(resp.feed.id, function(err){
                if( err ){ return callback(err); }
                return callback(null, {status: 'success', feed: resp.feed});
            });
        });
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