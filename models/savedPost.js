var _ = require('underscore');
var async = require('async');
var r = require('rethinkdb');

var BaseModel = require('../lib/rethink_base_model');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // defines the rethink indexes
    model.indexes = [{user_post: ['userId', 'postId']},
                     'userId',
                     'timestamp'];

    /**
        Required:
            userId
            postId/postIds
    */
    model.save = function(options, callback){
        var self = this;
        var postIds = this._getPostIds(options);
        var savedPosts = _.map(postIds, function(postId){
            return {    postId: postId,
                        userId: options.userId,
                        timestamp: Date.now()   };
        });
        async.eachLimit(savedPosts,
                        this.settings.parallelLimit,
                        function(savedPost, saveCallback){

            self.getUserPost({  userId: options.userId,
                                postId: savedPost.postId },
                             function(err, posts){
                if( posts.length > 0 ){ return saveCallback(); }
                self.create(savedPost, saveCallback);
            })
        }, callback);
        // this.create(savedPosts, callback);
    }

    model.settings = {
        pageSize: 20,
        parallelLimit: 10
    }

    /**
        Required:
            userId
            postId/postIds
    */
    model.delete = function(options, callback){
        var postIds = this._getPostIds(options);
        var args = _.map(postIds, function(postId){
            return[options.userId, postId];
        });
        r.table(this.name)
            .getAll(r.args(args), {index: 'user_post'})
            .delete()
            .run(this.connection, callback)
    }

    /**
        Required:
            options.userId
        Optional:
            options.page (defaults to 1)
            options.pageSize (defaults to this.settings.pageSize)

    */
    model.getUserPosts = function(options, callback){
        var pageSize = options.pageSize ?
                       options.pageSize : this.settings.pageSize;
        var page = options.page ? options.page : 1;
        var sliceStart = (page - 1) * pageSize;
        var sliceEnd = page * pageSize - 1;

        r.table(this.name)
            .getAll(options.userId, {index: 'userId'})
            .orderBy(r.desc('timestamp'))
            .slice(sliceStart, sliceEnd)
            .coerceTo('array')
            .run(this.connection, callback)
    }

    /**
        Required:
            options.userId
            options.postId
    */
    model.getUserPost = function(options, callback){
        r.table(this.name)
            .getAll([options.userId, options.postId], {index: 'user_post'})
            .coerceTo('array')
            .run(this.connection, callback);
    }

    model._getPostIds = function(options, callback){
        if( options.postId ){ return [options.postId]; }
        return options.postIds;
    }

    return model;
}