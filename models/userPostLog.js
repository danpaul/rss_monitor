var _ = require('underscore');
var async = require('async');
var BaseModel = require('../lib/rethink_base_model');
var r = require('rethinkdb');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {userId: '', postId: '', timestamp: 0};

    model.settings = {
        getLogLimit: 1000,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week,
        cleanCronFrequency: 1000 * 60 * 60 // hourly
    }

    model.init = function(){
        var self = this;
        setInterval(function(){
            self.cleanLogs()
        }, this.settings.cleanCronFrequency);
    }

    // defines the rethink indexes
    model.indexes = ['userId', 'timestamp', {userId_postId: ['userId', 'postId']}];

    /**
        Required:
            options.userId
            options.postId
    */
    model.add = function(options, callback){
        var self = this;
        model.hasRecord(options, function(err, hasRecord){
            if( err ){
                callback(err);
                return;
            }
            if( hasRecord ){
                callback();
                return;
            }
            options.timestamp = Date.now();
            self.create(options, callback);
        });
    }

    /**
        Required:
            options.posts (post IDS)
            options.userId
        Todo: this could be more efficient using getAll with the postId
            array then filtering based on the results
    */
    model.addMultiple = function(options, callbackIn){
        var self = this;
        async.eachSeries(options.posts, function(postId, callback){
            self.add({postId: postId, userId: options.userId}, callback);
        }, callbackIn);
    }

    /**
        Required:
            options.userId
    */
    model.getLog = function(options, callback){
        r.table(this.name)
            .getAll(options.userId, {index: 'userId'})
            .pluck('postId')
            .limit(this.settings.getLogLimit)
            .coerceTo('array')
            .run(this.connection, function(err, logs){
                if( err ){ callback(err); }
                else{
                    callback(null, _.map(logs, function(log){
                        return log.postId;
                    }));
                }
            });
    }

    /**
        Required:
            options.userId
            options.postId
    */
    model.hasRecord = function(options, callback){
        r.table(this.name).getAll([options.userId, options.postId],
                                  {index: 'userId_postId'})
            .coerceTo('array')
            .run(this.connection, function(err, result){
                if( err ){ callback(err); }
                else{
                    callback(null, (result.length > 0));
                }
            });
    }

    /**
        Permanently deletes expired logs!

        Optional:
            options.maxAge (how many ms into past to keep logs alive)
    */
    model.cleanLogs = function(options, callback){
        var self = this;
        var maxAge = this.settings.maxAge;
        if( typeof(options) !== 'undefined' &&
            typeof(options.maxAge) !== 'undefined' ){

            maxAge = options.maxAge;
        }
        var timeCutoff = Date.now() - maxAge;

        r.table(self.name).filter(r.row("timestamp").lt(timeCutoff))
            .delete()
            .run(self.connection, callback);
    }

    model.init();
    return model;
}