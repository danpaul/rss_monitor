var BaseModel = require('../lib/rethink_base_model');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var decay = require('decay');
var errors = require('../lib/errors');
var r = require('rethinkdb');

var DEFAULT_CACHE_TIME = 1000 * 60 * 60 * 6; //6 hours
var DEFAULT_SLICE_SIZE = 100;

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);
    var wilsonScore = decay.wilsonScore();

    // set model defaults
    model.defaults  = {ranking: 0.0, upvotes: 0, downvotes: 0}

    // defines the rethink indexes
    model.indexes = ['guid', 'feedId', 'timestamp', 'ranking',
                     {feedId_timestamp: ['feedId', 'timestamp']},
                     {feedId_ranking: ['feedId', 'ranking']}];

    model.settings = {
        cacheTime: DEFAULT_CACHE_TIME,
        sliceSize: DEFAULT_SLICE_SIZE,
        decayTime: 1000 * 60 * 60 * 24 * 30, // time for ranking to decay to zero
        rankingUpdateInterval: 1000 * 60 * 60 // frequency of ranking update
    };

    model.init = function(){
        var self = this;
        // setInterval(this.updateRankings, this.settings.rankingUpdateInterval);
        setInterval(function(){
            self.updateRankings();
        }, this.settings.rankingUpdateInterval);
    }

    /**
        required: feedData.guid, feedData.feedId

        Note: new feed object only gets passed back if a new object is created
    */
    model.save = function(feedData, feed, callback){
        var self = this;

        var date = new Date(feedData.date);
        feedData.timestamp = Date.now();

        feedData.feedId = feed.id ? feed.id : '';
        feedData.feedName = feed.name ? feed.name : '';
        feedData.feedUrl = feed.url ? feed.url : '';

        // if already in cache, do nothing, it's already saved
        if( cache.get(feedData.guid) ){ return callback(); }

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
                    if( err ){ return callback(err); }
                    // update cache
                    cache.put(feedData.guid, true, model.settings.cacheTime);
                    self.vote({postId: newObject.id, upvote: true},
                              function(err){
                        if( err ){ return callback(err); }
                        callback(null, newObject);
                    });
                });
            }
        });
    }

    /**
        required: options.feedIds (array)
        optional:
            options.page
            options.sortField (either 'date' or 'ranking')
    */
    model.getFromFeeds = function(options, callback){

        var page = options.page ? options.page : 1;
        var sliceStart = (page - 1) * this.settings.sliceSize;
        var sliceEnd = page * this.settings.sliceSize - 1;
        var sortField = (options.sortField && options.sortField === 'ranking') ?
                        'ranking' : 'date';

        // Todo: improve this query
        var query = r.table(this.name);

        if( options.feedIds.length === 0 ){ return callback(null, []); }
        if( options.feedIds.length > 1 ){
            query = query.getAll(r.args(options.feedIds), {index: 'feedId'})
        } else {
            query = query.getAll(options.feedIds[0], {index: 'feedId'})
        }

        // query = query.orderBy('timestamp');
        // todo: need more efficient index here
        if( sortField === 'date' ){
            // query = query.orderBy({index: r.desc('timestamp')});
            query = query.orderBy(r.desc('timestamp'));
        } else {
            // query = query.orderBy({index: r.desc('ranking')});
            query = query.orderBy(r.desc('ranking'));
        }

        if( !options.unlimit || options.unlimit !== true ){
            query = query.slice(sliceStart, sliceEnd);
        }

        query.run(this.connection, function(err, result){
            if( err ){ callback(err);
            } else { callback(null, result); }
        });
    }

    model.validatePost = function(post){
        if( !post ||
            !post.title ||
            !post.description ||
            !post.guid ){ return false; }
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

    /**
        Required:
            options.upvote (true if upvote, else false)
            options.postId
    */
    model.vote = function(options, callback){
        var self = this;
        this.get(options.postId, function(err, post){
            if( err ){ return callback(err); }

            if( options.upvote ){ post.upvotes++; }
            else { post.downvotes++; }
            post.ranking = self.calculateRanking(post.upvotes,
                                                 post.downvotes,
                                                 post.timestamp);
            self.update(post, callback);
        })
    }

    // wilson score with a linear decay
    model.calculateRanking = function(upvotes, downvotes, timestamp){
        var timeAgo = Date.now() - timestamp;
        if( timeAgo > this.settings.decayTime ){ return 0; }

        return wilsonScore(upvotes, downvotes) *
               ( 1 - (timeAgo / this.settings.decayTime) );
    }

    model.updateRankings = function(options, callbackIn){
        var self = this;
        var callback = callbackIn ? callbackIn : function(){};
        var hadError = false;
        var lastError = null;
        r.table(this.name).between(0,
                                   r.maxval,
                                   {leftBound: 'open', index: "ranking"})
            .run(this.connection, function(err, cursor){
                if( err ){ return callback(err); }
                cursor.each(function(err, row) {
                    if( err ){
                        console.log(err);
                        hadError = true;
                        lastError = err;
                        return;
                    }
                    self.updateRowRanking(row, function(err){
                        if( err ){
                            console.log(err);
                            hadError = true;
                            lastError = err;
                        }
                    });
                }, function(){
                    if( hadError ){
                        callback(lastError);
                    } else {
                        callback();
                    }
                });
            });
    }

    model.updateRowRanking = function(post, callback){
        var updateObject = {id: post.id};
        updateObject.ranking = this.calculateRanking(post.upvotes,
                                                     post.downvotes,
                                                     post.timestamp);
        this.update(updateObject, callback);
    }

    return model;
}