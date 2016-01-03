var BaseModel = require('../lib/rethink_base_model');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var errors = require('../lib/errors');
var r = require('rethinkdb');

var DEFAULT_CACHE_TIME = 1000 * 60 * 60 * 6; //6 hours
var DEFAULT_SLICE_SIZE = 100;

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {defaultField: true}

    // defines the rethink indexes
    model.indexes = ['guid', 'feedId', 'timestamp',
                     {feedId_timestamp: ['feedId', 'timestamp']}];

    model.settings = {
        cacheTime: DEFAULT_CACHE_TIME,
        sliceSize: DEFAULT_SLICE_SIZE
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

        // validate post
        if( !this.validatePost(feedData) ){
            return callback(null, errors.invalidPost);
        }

        // format post
        this.formatPost(feedData);

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

    /**
        required: options.feedIds (array)
        optional: options.page
    */
    model.getFromFeeds = function(options, callback){
        var page = options.page ? options.page : 1;
        var sliceStart = (page - 1) * this.settings.sliceSize;
        var sliceEnd = page * this.settings.sliceSize - 1;

        // Todo: improve this query
        var query = r.table(this.name)
                        .getAll(r.args(options.feedIds), {index: 'feedId'})
                        .orderBy('timestamp');

        if( !options.unlimit || options.unlimit !== true ){
            query = query.slice(sliceStart, sliceEnd);
        }

        query.run(this.connection, function(err, result){
            if( err ){ callback(err);
            } else { callback(null, result); }
        })
    }

    model.validatePost = function(post){
        if( !post ||
            !post.title ||
            !post.description ){ return false; }
        return true;
    }

    model.formatPost = function(post){
        var image = '';
        if( post.image &&
            post.image.url ){
            image = post.image.url;
        } else {
            image = this.getImage(post.description);
        }
        post.postImage = image;
    }

    model.getImage = function(htmlString){
        var $ = cheerio.load(htmlString);
        var imgSrc = $('img').attr('src');
        if( !imgSrc ){ imgSrc = ''; }
        return imgSrc;
    }

    return model;
}