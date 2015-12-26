var BaseModel = require('../lib/rethink_base_model');
var cache = require('memory-cache');

var DEFAULT_CACHE_TIME = 1000 * 60 * 60 * 6; //6 hours

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {defaultField: true}

    // defines the rethink indexes
    model.indexes = ['guid', 'feedId', 'timestamp',
                     {feedId_timestamp: ['feedId', 'timestamp']}];

    model.settings = {
        cacheTime: DEFAULT_CACHE_TIME
    };

    /**
        required: feedData.guid, feedData.feedId
    */
    model.save = function(feedData, callback){
        var date = new Date(feedData.date);
        feedData.timestamp = date.getTime();
        var self = this;

        // if already in cache, do nothing, it's already saved
        if( cache.get(feedData.guid) ){
            callback();
            return;
        }

        // check if already in DB
        this.hasItem({row: 'guid', value: feedData.guid}, function(err, hasItem){
            if( err ){
                callback(err);
                return;
            }
            if( hasItem ){
                // update cache
                cache.put(feedData.guid, true, model.settings.cacheTime);
            } else {
                // save item
                self.create(feedData, function(err, newObject){
                    if( err ){
                        callback(err);
                        return;
                    }
                    // update cache
                    cache.put(feedData.guid, true, model.settings.cacheTime);
                    callback(null);
                });
            }
        });
    }
    return model;
}